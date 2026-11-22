import { GROUND_Y, MISSIONS, type Mission, type Point, type Rect } from "./volunteerMissions";

export type Action = "left" | "right" | "jump";
export type Phase = "briefing" | "playing" | "paused" | "won" | "lost";
export type Cue = "collect" | "stomp" | "hurt" | "jump" | "checkpoint" | "finish";
export type GameStatus = "playing" | "won" | "lost";

export interface GameResult {
  status: Exclude<GameStatus, "playing">;
  score: number;
}

export const WORLD_HEIGHT = 432;
export const STEP = 1 / 60;
export const START_LIVES = 3;
export const CENTRE_URL = "https://mai.ru/campus/360/ump/volunteer/";

interface Player extends Rect {
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  coyote: number;
  invulnerable: number;
}

interface Rover extends Rect {
  vx: number;
  min: number;
  max: number;
  active: boolean;
}

interface Token extends Point { taken: boolean }
interface Particle extends Point { vx: number; vy: number; life: number; color: string }
export interface Controls { left: boolean; right: boolean; heldJump: boolean; jumpPressed: boolean }

export interface Game {
  missionIndex: number;
  mission: Mission;
  player: Player;
  tokens: Token[];
  rovers: Rover[];
  particles: Particle[];
  camera: number;
  time: number;
  points: number;
  entryPoints: number;
  collected: number;
  lives: number;
  phase: Phase;
  jumpBuffer: number;
  checkpoint: boolean;
}

const PLAYER_W = 24;
const PLAYER_H = 42;
const SPEED = 272;
const JUMP = 622;
const GRAVITY = 1530;
const START_X = 74;
const TOKEN_COLORS = ["#ffdd62", "#fff1a4", "#ffffff"];
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const intersects = (a: Rect, b: Rect) => (
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
);

function spawn(x: number, y: number): Player {
  return { x, y: y - PLAYER_H, w: PLAYER_W, h: PLAYER_H, vx: 0, vy: 0, facing: 1, grounded: true, coyote: 0, invulnerable: 0 };
}

export function newGame(missionIndex = 0, points = 0, lives = START_LIVES): Game {
  const mission = MISSIONS[missionIndex];
  return {
    missionIndex, mission, player: spawn(START_X, GROUND_Y), camera: 0,
    tokens: mission.tokens.map((item) => ({ ...item, taken: false })),
    rovers: mission.rovers.map((rover) => ({
      x: rover.x, y: GROUND_Y - 27, w: 28, h: 27,
      vx: -rover.speed, min: rover.min, max: rover.max, active: true,
    })),
    particles: [], time: 0, points, entryPoints: points, collected: 0, lives, phase: "briefing",
    jumpBuffer: 0, checkpoint: false,
  };
}

export function retryGame(game: Game): Game {
  return newGame(game.missionIndex, game.entryPoints);
}

export interface MissionProgress {
  missionIndex: number;
  points: number;
  lives: number;
}

export function getMissionProgress(game: Game): MissionProgress {
  return { missionIndex: game.missionIndex, points: game.entryPoints, lives: game.lives || START_LIVES };
}

export function restoreGame(progress: unknown): Game | undefined {
  if (!progress || typeof progress !== "object") return;
  const { missionIndex, points, lives } = progress as Partial<MissionProgress>;
  if (
    typeof missionIndex !== "number" || !Number.isInteger(missionIndex) || missionIndex < 0 || missionIndex >= MISSIONS.length
    || typeof points !== "number" || !Number.isSafeInteger(points) || points < 0
    || typeof lives !== "number" || !Number.isInteger(lives) || lives < 1 || lives > START_LIVES
  ) return;
  return newGame(missionIndex, points, lives);
}

function burst(game: Game, x: number, y: number, color = TOKEN_COLORS) {
  for (let i = 0; i < 7; i++) {
    game.particles.push({ x, y, vx: (i - 3) * 25, vy: -76 - (i % 3) * 35, life: 0.34 + (i % 2) * 0.17, color: color[i % color.length] });
  }
}

function hurt(game: Game, cue: (cue: Cue) => void, width: number) {
  game.lives--;
  cue("hurt");
  if (game.lives === 0) {
    game.phase = "lost";
    return;
  }
  const position = game.checkpoint ? game.mission.checkpoint : { x: START_X, y: GROUND_Y };
  game.player = spawn(position.x, position.y);
  game.player.invulnerable = 1.1;
  game.jumpBuffer = 0;
  game.camera = cameraTarget(game, width);
}

function cameraTarget(game: Game, width: number) {
  return clamp(game.player.x - width * 0.31, 0, Math.max(0, game.mission.width - width));
}

export function fitCamera(game: Game, width: number) {
  game.camera = cameraTarget(game, width);
}

export function stepGame(game: Game, input: Controls, width: number, cue: (cue: Cue) => void) {
  if (game.phase !== "playing") return;
  const { player, mission } = game;
  const previousBottom = player.y + player.h;
  const direction = Number(input.right) - Number(input.left);
  const target = direction * SPEED;

  game.time += STEP;
  player.invulnerable = Math.max(0, player.invulnerable - STEP);
  player.vx += clamp(target - player.vx, -3000 * STEP, 3000 * STEP);
  if (direction !== 0) player.facing = direction > 0 ? 1 : -1;
  if (player.grounded) player.coyote = 0.105;
  else player.coyote = Math.max(0, player.coyote - STEP);
  game.jumpBuffer = input.jumpPressed ? 0.13 : Math.max(0, game.jumpBuffer - STEP);

  if (game.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -JUMP;
    player.grounded = false;
    player.coyote = 0;
    game.jumpBuffer = 0;
    cue("jump");
  }
  if (!input.heldJump && player.vy < -255) player.vy = -255;
  player.vy = Math.min(player.vy + GRAVITY * STEP, 810);

  player.x = clamp(player.x + player.vx * STEP, 0, mission.width - player.w);
  // Raised platforms can be reached from underneath. Ground and pit walls stay solid.
  for (const solid of mission.platforms) {
    if (solid.y !== GROUND_Y || !intersects(player, solid)) continue;
    if (player.vx > 0) player.x = solid.x - player.w;
    else if (player.vx < 0) player.x = solid.x + solid.w;
    player.vx = 0;
  }

  player.y += player.vy * STEP;
  player.grounded = false;
  if (player.vy >= 0) {
    let landingY = Infinity;
    for (const solid of mission.platforms) {
      if (player.x + player.w <= solid.x || player.x >= solid.x + solid.w) continue;
      if (previousBottom <= solid.y + 0.01 && player.y + player.h >= solid.y) {
        landingY = Math.min(landingY, solid.y);
      }
    }
    if (landingY < Infinity) {
      player.y = landingY - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  if (player.y > WORLD_HEIGHT + 32) {
    hurt(game, cue, width);
    return;
  }

  if (!game.checkpoint && player.x + player.w >= mission.checkpoint.x) {
    game.checkpoint = true;
    cue("checkpoint");
    burst(game, mission.checkpoint.x, mission.checkpoint.y - 39, ["#82f4d4", "#ffffff"]);
  }

  for (const item of game.tokens) {
    if (item.taken || !intersects(player, { x: item.x - 12, y: item.y - 12, w: 24, h: 24 })) continue;
    item.taken = true;
    game.points += 10;
    game.collected++;
    cue("collect");
    burst(game, item.x, item.y);
  }

  for (const rover of game.rovers) {
    if (!rover.active) continue;
    rover.x = clamp(rover.x + rover.vx * STEP, rover.min, rover.max);
    if ((rover.x === rover.min && rover.vx < 0) || (rover.x === rover.max && rover.vx > 0)) rover.vx *= -1;
    if (!intersects(player, rover)) continue;

    if (player.vy > 0 && previousBottom <= rover.y + 5) {
      rover.active = false;
      player.y = rover.y - player.h;
      player.vy = -350;
      game.points += 100;
      cue("stomp");
      burst(game, rover.x + rover.w / 2, rover.y);
    } else if (player.invulnerable <= 0) {
      hurt(game, cue, width);
      return;
    }
  }

  if (intersects(player, { x: mission.goalX - 8, y: GROUND_Y - 92, w: 45, h: 92 })) {
    cue("finish");
    game.phase = game.missionIndex === MISSIONS.length - 1 ? "won" : "briefing";
    if (game.phase === "briefing") {
      const next = newGame(game.missionIndex + 1, game.points, game.lives);
      Object.assign(game, next);
    }
    return;
  }

  for (const particle of game.particles) {
    particle.x += particle.vx * STEP;
    particle.y += particle.vy * STEP;
    particle.vy += 380 * STEP;
    particle.life -= STEP;
  }
  game.particles = game.particles.filter((particle) => particle.life > 0);
  game.camera += (cameraTarget(game, width) - game.camera) * 0.13;
}
