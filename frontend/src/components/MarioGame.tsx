import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";


interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

interface Player extends Rect {
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
}

interface Coin extends Point {
  r: number;
  taken: boolean;
}

interface EnemyData extends Rect {
  vx: number;
  minX: number; 
  maxX: number;
}

interface Enemy extends EnemyData {
  alive: boolean;
}

interface LevelData {
  width: number;
  spawn: Point;
  platforms: Rect[];
  coins: Point[];
  enemies: EnemyData[];
  goal: Rect;
}

export type GameStatus = "playing" | "won" | "lost";

interface GameState {
  level: LevelData;
  player: Player;
  coins: Coin[];
  enemies: Enemy[];
  camX: number;
  score: number;
  lives: number;
  status: GameStatus;
}

interface Input {
  left: boolean;
  right: boolean;
  jump: boolean;
}

type InputAction = keyof Input;

interface HudState {
  score: number;
  lives: number;
  status: GameStatus;
}

export interface GameResult {
  status: Exclude<GameStatus, "playing">;
  score: number;
}

export interface MarioGameProps {
  onGameEnd?: (result: GameResult) => void;
}



const VIEW_W = 800; 
const VIEW_H = 450;

const GRAVITY = 1800; // px/s²
const MOVE_SPEED = 260; // px/s
const JUMP_SPEED = 680; // px/s
const MAX_FALL_SPEED = 900;
const START_LIVES = 3;

const COLORS = {
  sky: "#8ecae6",
  ground: "#6b4f3a",
  platform: "#8d6e4f",
  player: "#d62828",
  enemy: "#4a4e69",
  coin: "#ffb703",
  goal: "#2a9d8f",
} as const;

const KEY_MAP: Record<string, InputAction> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
};


const createLevel = (): LevelData => ({
  width: 3200,
  spawn: { x: 60, y: 300 },
  platforms: [
    { x: 0, y: 400, w: 900, h: 50 },
    { x: 1050, y: 400, w: 700, h: 50 },
    { x: 1900, y: 400, w: 1300, h: 50 },
  
    { x: 350, y: 300, w: 120, h: 20 },
    { x: 600, y: 230, w: 120, h: 20 },
    { x: 1250, y: 300, w: 160, h: 20 },
    { x: 1550, y: 240, w: 120, h: 20 },
    { x: 2200, y: 300, w: 200, h: 20 },
  ],
  coins: [
    { x: 400, y: 260 },
    { x: 650, y: 190 },
    { x: 1300, y: 260 },
    { x: 1600, y: 200 },
    { x: 2280, y: 260 },
    { x: 2600, y: 360 },
  ],
  enemies: [
    { x: 800, y: 370, w: 30, h: 30, vx: -60, minX: 700, maxX: 880 },
    { x: 1400, y: 370, w: 30, h: 30, vx: -60, minX: 1250, maxX: 1700 },
    { x: 2500, y: 370, w: 30, h: 30, vx: -80, minX: 2300, maxX: 2900 },
  ],
  goal: { x: 3100, y: 300, w: 20, h: 100 },
});


const createInitialState = (): GameState => {
  const level = createLevel();
  return {
    level,
    player: {
      x: level.spawn.x,
      y: level.spawn.y,
      w: 28,
      h: 40,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
    },
    coins: level.coins.map((c) => ({ ...c, r: 10, taken: false })),
    enemies: level.enemies.map((e) => ({ ...e, alive: true })),
    camX: 0,
    score: 0,
    lives: START_LIVES,
    status: "playing",
  };
};



const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function hurtPlayer(s: GameState): void {
  s.lives -= 1;
  if (s.lives <= 0) {
    s.status = "lost";
    return;
  }
  const { spawn } = s.level;
  Object.assign(s.player, { x: spawn.x, y: spawn.y, vx: 0, vy: 0 });
}

function update(s: GameState, input: Input, dt: number): void {
  if (s.status !== "playing") return;
  const { player: p, level } = s;

  // --- управление ---
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  p.vx = dir * MOVE_SPEED;
  if (dir > 0) p.facing = 1;
  else if (dir < 0) p.facing = -1;

  if (input.jump && p.onGround) {
    p.vy = -JUMP_SPEED;
    p.onGround = false;
  }
 
  if (!input.jump && p.vy < -200) p.vy = -200;

  p.vy = Math.min(p.vy + GRAVITY * dt, MAX_FALL_SPEED);

  
  p.x += p.vx * dt;
  p.x = clamp(p.x, 0, level.width - p.w);
  for (const plat of level.platforms) {
    if (!overlaps(p, plat)) continue;
    if (p.vx > 0) p.x = plat.x - p.w;
    else if (p.vx < 0) p.x = plat.x + plat.w;
  }

  p.y += p.vy * dt;
  p.onGround = false;
  for (const plat of level.platforms) {
    if (!overlaps(p, plat)) continue;
    if (p.vy > 0) {
      p.y = plat.y - p.h;
      p.onGround = true;
    } else if (p.vy < 0) {
      p.y = plat.y + plat.h;
    }
    p.vy = 0;
  }

  // --- упал в яму ---
  if (p.y > VIEW_H + 100) hurtPlayer(s);

  // --- монетки ---
  for (const c of s.coins) {
    if (c.taken) continue;
    const box: Rect = { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
    if (overlaps(p, box)) {
      c.taken = true;
      s.score += 10;
    }
  }

  // --- враги ---
  for (const e of s.enemies) {
    if (!e.alive) continue;
    e.x += e.vx * dt;
    if (e.x < e.minX || e.x + e.w > e.maxX) e.vx *= -1;

    if (overlaps(p, e)) {
      const stomped = p.vy > 0 && p.y + p.h - e.y < 20;
      if (stomped) {
        e.alive = false;
        p.vy = -JUMP_SPEED * 0.6;
        s.score += 100;
      } else {
        hurtPlayer(s);
        return;
      }
    }
  }

  // --- финиш ---
  if (overlaps(p, level.goal)) s.status = "won";

  // --- камера ---
  s.camX = clamp(p.x - VIEW_W / 2, 0, level.width - VIEW_W);
}



function draw(ctx: CanvasRenderingContext2D, s: GameState): void {
  const { player: p, level, camX } = s;

  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // платформы
  for (const plat of level.platforms) {
    ctx.fillStyle = plat.h >= 50 ? COLORS.ground : COLORS.platform;
    ctx.fillRect(plat.x - camX, plat.y, plat.w, plat.h);
  }

  // финиш
  ctx.fillStyle = COLORS.goal;
  ctx.fillRect(level.goal.x - camX, level.goal.y, level.goal.w, level.goal.h);

  // монетки
  ctx.fillStyle = COLORS.coin;
  for (const c of s.coins) {
    if (c.taken) continue;
    ctx.beginPath();
    ctx.arc(c.x - camX, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // враги
  ctx.fillStyle = COLORS.enemy;
  for (const e of s.enemies) {
    if (e.alive) ctx.fillRect(e.x - camX, e.y, e.w, e.h);
  }

  // игрок
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(p.x - camX, p.y, p.w, p.h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(p.x - camX + (p.facing > 0 ? p.w - 10 : 4), p.y + 8, 6, 6);
}




function useMedia(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

interface TouchButtonProps {
  action: InputAction;
  label: string;
  onChange: (action: InputAction, pressed: boolean) => void;
  children: ReactNode;
}


function TouchButton({ action, label, onChange, children }: TouchButtonProps) {
  const release = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onChange(action, false);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onChange(action, true);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: "clamp(56px, 16vmin, 84px)",
        height: "clamp(56px, 16vmin, 84px)",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.8)",
        background: "rgba(0,0,0,0.35)",
        color: "#fff",
        fontSize: 28,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}



export default function MarioGame({ onGameEnd }: MarioGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const inputRef = useRef<Input>({ left: false, right: false, jump: false });
  const endedRef = useRef(false);
  const onEndRef = useRef<MarioGameProps["onGameEnd"]>(onGameEnd);
  onEndRef.current = onGameEnd;

  const isTouch = useMedia("(pointer: coarse)");
  const isLandscape = useMedia("(orientation: landscape)");

  
  const [hud, setHud] = useState<HudState>({
    score: 0,
    lives: START_LIVES,
    status: "playing",
  });

  const setInput = useCallback((action: InputAction, pressed: boolean) => {
    inputRef.current[action] = pressed;
  }, []);

  // клавиатура
  useEffect(() => {
    const handle = (e: KeyboardEvent, pressed: boolean) => {
      const action = KEY_MAP[e.code] as InputAction | undefined;
      if (!action) return;
      e.preventDefault(); 
      inputRef.current[action] = pressed;
    };
    const down = (e: KeyboardEvent) => handle(e, true);
    const up = (e: KeyboardEvent) => handle(e, false);
    
    const reset = () => {
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.jump = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);

  // игровой цикл
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VIEW_W * dpr;
    canvas.height = VIEW_H * dpr;
    ctx.scale(dpr, dpr);

    let rafId = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30); 
      last = now;

      const s = stateRef.current;
      update(s, inputRef.current, dt);
      draw(ctx, s);

      setHud((prev) =>
        prev.score === s.score && prev.lives === s.lives && prev.status === s.status
          ? prev
          : { score: s.score, lives: s.lives, status: s.status }
      );

      if (s.status !== "playing" && !endedRef.current) {
        endedRef.current = true;
        onEndRef.current?.({ status: s.status, score: s.score });
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    endedRef.current = false;
    setHud({ score: 0, lives: START_LIVES, status: "playing" });
  }, []);

  const controlsStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    padding: 12,
    ...(isLandscape
      ? { position: "absolute", left: 0, right: 0, bottom: 0, pointerEvents: "none" }
      : {}),
  };

  const controls = (
    <div style={controlsStyle}>
      <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
        <TouchButton action="left" label="Влево" onChange={setInput}>
          ◀
        </TouchButton>
        <TouchButton action="right" label="Вправо" onChange={setInput}>
          ▶
        </TouchButton>
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <TouchButton action="jump" label="Прыжок" onChange={setInput}>
          ▲
        </TouchButton>
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: VIEW_W,
        margin: "0 auto",
        touchAction: "none", 
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
        <span>Очки: {hud.score}</span>
        <span>Жизни: {hud.lives}</span>
      </div>

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            aspectRatio: `${VIEW_W} / ${VIEW_H}`,
            
            maxWidth: `calc((100dvh - 48px) * ${VIEW_W / VIEW_H})`,
            margin: "0 auto",
            borderRadius: 8,
          }}
        />

        {isTouch && isLandscape && controls}

        {hud.status !== "playing" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              borderRadius: 8,
            }}
          >
            <h2 style={{ margin: 0 }}>
              {hud.status === "won" ? "Уровень пройден!" : "Игра окончена"}
            </h2>
            <p style={{ margin: 0 }}>Очки: {hud.score}</p>
            <button type="button" onClick={restart}>
              Играть снова
            </button>
          </div>
        )}
      </div>

     
      {isTouch && !isLandscape && controls}

      <p style={{ fontSize: 14, opacity: 0.7, textAlign: "center" }}>
        {isTouch
          ? isLandscape
            ? "Прыгайте на врагов сверху и собирайте монетки."
            : "Поверните телефон горизонтально — играть удобнее."
          : "Управление: ← → или A/D — бег, пробел / ↑ / W — прыжок. Прыгайте на врагов сверху."}
      </p>
    </div>
  );
}


