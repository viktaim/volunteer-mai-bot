import {
  useCallback, useEffect, useId, useRef, useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { drawGame, drawIcon, type IconName } from "./mario-game/pixelArt";
import {
  CENTRE_URL, START_LIVES, STEP, WORLD_HEIGHT, fitCamera, getMissionProgress,
  newGame, restoreGame, retryGame, stepGame, type Action, type Cue, type Game, type GameResult,
} from "./mario-game/volunteerGame";
import { MISSIONS } from "./mario-game/volunteerMissions";
import "./mario-game/MarioGame.css";

export type { GameResult, GameStatus } from "./mario-game/volunteerGame";

export interface MarioGameProps {
  onGameEnd?: (result: GameResult) => void;
}

const KEY_ACTION: Partial<Record<string, Action>> = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  Space: "jump", ArrowUp: "jump", KeyW: "jump",
};
const LABELS: Record<Action, string> = { left: "Влево", right: "Вправо", jump: "Прыжок" };
const NOTES: Record<Cue, number[]> = {
  jump: [330, 480], collect: [660, 880], stomp: [240, 480],
  hurt: [230, 120], checkpoint: [390, 520, 660], finish: [523, 659, 784],
};
const SAVE_KEY = "mai-polet-dobra:mission-v1";
const TOTAL_MISSIONS = MISSIONS.length;

function readProgress() {
  try {
    return restoreGame(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "null"));
  } catch {
    return undefined;
  }
}

function saveProgress(game: Game) {
  try {
    if (game.phase === "won") window.localStorage.removeItem(SAVE_KEY);
    else window.localStorage.setItem(SAVE_KEY, JSON.stringify(getMissionProgress(game)));
  } catch {
    // Progress is optional in WebViews with blocked storage.
  }
}

function getHud(game: Game) {
  const { phase, points, collected, lives, mission, missionIndex } = game;
  return { phase, points, collected, lives, mission, missionIndex };
}

function PixelIcon({ name }: { name: IconName }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawIcon(ref.current, name);
  }, [name]);
  return <canvas ref={ref} width={12} height={12} className="mario-game__icon" aria-hidden="true" />;
}

function TouchButton({ action, onInput }: {
  action: Action;
  onInput: (action: Action, pointerId: number, pressed: boolean) => void;
}) {
  const pointers = useRef(new Set<number>());
  const down = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    pointers.current.add(event.pointerId);
    onInput(action, event.pointerId, true);
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer leave and the window release handler also clear the input.
    }
  };
  const release = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointers.current.delete(event.pointerId)) onInput(action, event.pointerId, false);
  };
  return (
    <button
      type="button"
      aria-label={LABELS[action]}
      tabIndex={-1}
      className={`mario-game__control mario-game__control--${action}`}
      onPointerDown={down}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onPointerLeave={(event) => {
        if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) release(event);
      }}
    >
      <PixelIcon name={action} />
      {action === "jump" && <span>{LABELS[action]}</span>}
    </button>
  );
}

export default function MarioGame({ onGameEnd }: MarioGameProps) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const [initial] = useState(() => readProgress() ?? newGame());
  const game = useRef(initial);
  const [hud, setHud] = useState(() => getHud(initial));
  const [sound, setSound] = useState(false);
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const soundEnabled = useRef(false);
  const onEnd = useRef(onGameEnd);
  const keys = useRef(new Set<string>());
  const pointers = useRef(new Map<number, Action>());
  const jumpQueued = useRef(false);
  const titleId = useId();
  const briefingId = useId();
  const isPlaying = hud.phase === "playing";
  const isPaused = hud.phase === "paused";
  const isWon = hud.phase === "won";
  const isLost = hud.phase === "lost";

  useEffect(() => { onEnd.current = onGameEnd; }, [onGameEnd]);

  const clearInput = useCallback(() => {
    keys.current.clear();
    pointers.current.clear();
    jumpQueued.current = false;
    game.current.jumpBuffer = 0;
  }, []);

  const pressed = useCallback((action: Action) => {
    for (const code of keys.current) if (KEY_ACTION[code] === action) return true;
    for (const control of pointers.current.values()) if (control === action) return true;
    return false;
  }, []);

  const touchInput = useCallback((action: Action, id: number, down: boolean) => {
    if (!down) {
      pointers.current.delete(id);
      return;
    }
    if (game.current.phase !== "playing") return;
    if (action === "jump" && !pressed("jump")) jumpQueued.current = true;
    pointers.current.set(id, action);
  }, [pressed]);

  const playCue = useCallback((cue: Cue) => {
    const context = audio.current;
    if (!soundEnabled.current || context?.state !== "running") return;

    NOTES[cue].forEach((pitch, index) => {
      const start = context.currentTime + index * 0.075;
      const wave = context.createOscillator();
      const volume = context.createGain();
      wave.type = "triangle";
      wave.frequency.value = pitch;
      volume.gain.setValueAtTime(0.045, start);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      wave.connect(volume);
      volume.connect(context.destination);
      wave.start(start);
      wave.stop(start + 0.11);
      wave.onended = () => { wave.disconnect(); volume.disconnect(); };
    });
  }, []);

  const pause = useCallback(() => {
    const current = game.current;
    if (current.phase !== "playing") return;
    clearInput();
    current.phase = "paused";
    setHud(getHud(current));
  }, [clearInput]);

  const start = useCallback(() => {
    const current = game.current;
    clearInput();
    if (current.phase === "won" || current.phase === "lost") {
      const next = current.phase === "lost" ? retryGame(current) : newGame();
      game.current = next;
      saveProgress(next);
      setHud(getHud(next));
      return;
    }
    current.phase = "playing";
    if (soundEnabled.current) void audio.current?.resume().catch(() => {});
    setHud(getHud(current));
  }, [clearInput]);

  const toggleSound = () => {
    if (soundEnabled.current) {
      soundEnabled.current = false;
      setSound(false);
      void audio.current?.suspend().catch(() => {});
      return;
    }
    const Audio = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    try {
      const context = audio.current ?? new Audio();
      audio.current = context;
      soundEnabled.current = true;
      setSound(true);
      void context.resume().then(() => playCue("collect")).catch(() => {
        if (audio.current !== context) return;
        soundEnabled.current = false;
        setSound(false);
      });
    } catch {
      // Sound can be unavailable while the game itself remains playable.
    }
  };

  useEffect(() => () => {
    const context = audio.current;
    audio.current = null;
    if (context?.state !== "closed") void context?.close().catch(() => {});
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof Element && target !== document.body && !root.current?.contains(target)) return;
      if (event.code === "Escape") {
        event.preventDefault();
        pause();
        return;
      }
      const action = KEY_ACTION[event.code];
      if (!action || target instanceof HTMLAnchorElement || (event.code === "Space" && target instanceof HTMLButtonElement)) return;
      event.preventDefault();
      if (event.repeat) return;
      if (action === "jump" && !pressed("jump")) jumpQueued.current = true;
      keys.current.add(event.code);
    };
    const keyup = (event: KeyboardEvent) => keys.current.delete(event.code);
    const pointerRelease = (event: PointerEvent) => pointers.current.delete(event.pointerId);
    const visibility = () => { if (document.hidden) pause(); };

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("pointerup", pointerRelease);
    window.addEventListener("pointercancel", pointerRelease);
    window.addEventListener("blur", clearInput);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("pointerup", pointerRelease);
      window.removeEventListener("pointercancel", pointerRelease);
      window.removeEventListener("blur", clearInput);
      document.removeEventListener("visibilitychange", visibility);
      clearInput();
    };
  }, [clearInput, isPlaying, pause, pressed]);

  useEffect(() => {
    const gameRegion = root.current;
    const playfield = stage.current;
    const buttons = controls.current;
    if (!isPlaying || !gameRegion || !playfield || !buttons) return;

    const prevent = (event: Event) => {
      if (event.cancelable) event.preventDefault();
    };
    const touchEvents = ["touchstart", "touchmove"];
    const selectionEvents = ["selectstart", "contextmenu", "dragstart"];
    const surfaces = [playfield, buttons];

    for (const surface of surfaces) {
      for (const type of touchEvents) surface.addEventListener(type, prevent, { passive: false });
    }
    for (const type of selectionEvents) gameRegion.addEventListener(type, prevent);

    return () => {
      for (const surface of surfaces) {
        for (const type of touchEvents) surface.removeEventListener(type, prevent);
      }
      for (const type of selectionEvents) gameRegion.removeEventListener(type, prevent);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) stage.current?.focus({ preventScroll: true });
    else if (hud.phase !== "briefing" || root.current?.contains(document.activeElement)) {
      primary.current?.focus({ preventScroll: true });
    }
  }, [hud.phase, isPlaying]);

  useEffect(() => {
    const element = stage.current;
    const screen = canvas.current;
    if (!element || !screen) return;
    const context = screen.getContext("2d", { alpha: false });
    if (!context) {
      setCanvasUnavailable(true);
      return;
    }

    let viewWidth = 0;
    let animation = 0;
    let previous = 0;
    let backlog = 0;

    const measure = () => {
      const { clientWidth, clientHeight } = element;
      if (!clientWidth || !clientHeight) return;
      const worldWidth = Math.round((WORLD_HEIGHT / 2) * clientWidth / clientHeight);
      if (viewWidth === worldWidth * 2) return;
      screen.width = Math.max(1, worldWidth);
      screen.height = WORLD_HEIGHT / 2;
      viewWidth = screen.width * 2;
      context.setTransform(0.5, 0, 0, 0.5, 0, 0);
      context.imageSmoothingEnabled = false;
      fitCamera(game.current, viewWidth);
      drawGame(context, game.current, viewWidth);
    };
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    if (observer) observer.observe(element);
    else window.addEventListener("resize", measure);

    const frame = (now: number) => {
      const current = game.current;
      if (current.phase !== "playing") return;
      if (!viewWidth) {
        measure();
        if (!viewWidth) {
          animation = requestAnimationFrame(frame);
          return;
        }
      }
      backlog += previous ? Math.min((now - previous) / 1000, 0.05) : STEP;
      previous = now;
      const { points, lives } = current;

      if (backlog >= STEP) {
        while (backlog >= STEP && current.phase === "playing") {
          stepGame(current, {
            left: pressed("left"), right: pressed("right"),
            heldJump: pressed("jump"), jumpPressed: jumpQueued.current,
          }, viewWidth, playCue);
          jumpQueued.current = false;
          backlog -= STEP;
        }
        drawGame(context, current, viewWidth);
        const next = getHud(current);
        if (next.points !== points || next.lives !== lives || next.phase !== "playing") setHud(next);
        if (next.phase !== "playing") {
          clearInput();
          saveProgress(current);
          if (next.phase === "won" || next.phase === "lost") {
            onEnd.current?.({ status: next.phase, score: next.points });
          }
          return;
        }
      }
      animation = requestAnimationFrame(frame);
    };
    if (isPlaying) animation = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animation);
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", measure);
    };
  }, [clearInput, hud.phase, isPlaying, playCue, pressed]);

  const { collected, lives, mission, missionIndex, points } = hud;
  const title = isWon ? "Маршрут пройден!" : isPaused ? "Пауза" : isLost ? "Попробуем ещё?" : mission.title;
  const story = isWon
    ? `Очки за весь маршрут — ${points}. Чтобы присоединиться к волонтёрам МАИ, загляни в их центр и заполни анкету.`
    : isPaused ? "Игра продолжится с того места, где ты остановился."
    : isLost ? "Жизни закончились. Эту миссию можно повторить с тремя жизнями."
    : mission.story;

  return (
    <section className="mario-game" data-playing={isPlaying} aria-labelledby={titleId} ref={root}>
      <header className="mario-game__header">
        <h1 id={titleId}>Полёт добра</h1>
        <div className="mario-game__tools">
          <button type="button" className="mario-game__tool" onClick={toggleSound} aria-label={sound ? "Выключить звук" : "Включить звук"}>
            <PixelIcon name={sound ? "speaker" : "muted"} />
          </button>
          <button type="button" className="mario-game__tool" onClick={isPaused ? start : pause} disabled={!isPlaying && !isPaused} aria-label={isPaused ? "Продолжить игру" : "Пауза"}>
            <PixelIcon name={isPaused ? "right" : "pause"} />
          </button>
        </div>
      </header>

      <div className="mario-game__card" data-playing={isPlaying}>
        <dl className="mario-game__hud">
          <div>
            <dt>Миссия</dt>
            <dd>{missionIndex + 1}<span>/{TOTAL_MISSIONS}</span></dd>
          </div>
          <div>
            <dt>Жизни</dt>
            <dd className="mario-game__hearts" aria-label={`Жизней: ${lives} из ${START_LIVES}`}>
              {Array.from({ length: START_LIVES }, (_, i) => <PixelIcon name={i < lives ? "heart" : "emptyHeart"} key={i} />)}
            </dd>
          </div>
          <div>
            <dt>Жетоны</dt>
            <dd>{collected}<span>/{mission.tokens.length}</span></dd>
          </div>
          <div>
            <dt>Очки</dt>
            <dd>{points}</dd>
          </div>
        </dl>

        <div className="mario-game__stage" data-playing={isPlaying} ref={stage} tabIndex={-1} aria-label="Игровое поле">
          <canvas className="mario-game__world" ref={canvas} aria-hidden="true" />
          {canvasUnavailable && <p role="status">Игровое поле недоступно в этом браузере.</p>}
        </div>

        {isPlaying ? (
          <div className="mario-game__input">
            <div className="mario-game__controls" role="group" aria-label="Управление" ref={controls}>
              <div className="mario-game__direction">
                <TouchButton action="left" onInput={touchInput} />
                <TouchButton action="right" onInput={touchInput} />
              </div>
              <TouchButton action="jump" onInput={touchInput} />
            </div>
            <p className="mario-game__keys">A / D или ← → — бег · Пробел — прыжок</p>
          </div>
        ) : (
          <section className="mario-game__brief" aria-labelledby={briefingId}>
            {!isWon && !isLost && <div className="mario-game__topic">{mission.topic}</div>}
            <h2 id={briefingId}>{title}</h2>
            <p>{story}</p>
            {!isWon && !isLost && (
              <div className="mario-game__task"><PixelIcon name={mission.icon} /><span>{mission.task}</span></div>
            )}
            {isWon && <a className="mario-game__primary" href={CENTRE_URL} target="_blank" rel="noreferrer">Волонтёрский центр МАИ</a>}
            <button
              type="button"
              ref={primary}
              className={isWon ? "mario-game__secondary" : "mario-game__primary"}
              onClick={start}
              disabled={canvasUnavailable}
            >
              {isWon ? "Играть снова" : isLost ? "Повторить миссию" : isPaused ? "Продолжить" : "Начать миссию"}
            </button>
          </section>
        )}
      </div>
    </section>
  );
}
