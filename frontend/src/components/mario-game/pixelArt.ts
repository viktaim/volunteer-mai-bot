import { WORLD_HEIGHT, type Game } from "./volunteerGame";
import { GROUND_Y, type Rect, type Theme } from "./volunteerMissions";

const COLORS = {
  n: "#142446", d: "#24457e", b: "#347ce1", c: "#76c2ff", w: "#fff4e0",
  s: "#f3b486", t: "#c77867", y: "#ffe475", o: "#f1a347", a: "#a55a39",
  r: "#ea6982", g: "#60e0b8", m: "#299985", p: "#a18cfa", k: "#6b5db5",
};
type Pixels = readonly string[];
const badge = [
  "...nnnnnn...", "..nyyyyyyn..", ".nyywwyyyyn.", "nyywoooyyyon", "nyyoooyyyyon",
  "nyyyynnyyyon", "nyyynwwnyyon", "nyynwwwwnyon", ".nyyyyyyoon.", "..noooooon..", "...nnnnnn...",
];
const bottle = [
  "....nnnn....", "....nwwn....", "...nccccn...", "...nggggn...", "..ngwgggmn..", "..ngggggmn..",
  "..nggggmmn..", "..nggggmmn..", "..nmmmmmnn..", "...nnnnnn...",
];
const heart = [
  "..nn...nn..", ".nrrn.nrrn.", "nrwrrnrrrrn", "nrrrrrrrrrn", ".nrrrrrrrn.",
  "..nrrrrrn..", "...nrrrn...", "....nrn....", ".....n.....",
];
const emptyHeart = heart.map((row) => row.replace(/[rw]/g, "d"));
const star = [
  ".....n.....", "....nyn....", "....nyn....", ".nnnywynnn.", "nyyyyyyyyyn", ".noyyyyoon.",
  "..nyyyyyn..", "..nyynyyn..", "..non.non..", "..nn...nn..",
];
const plane = [
  "............", ".........ww.", ".......www..", ".....wwcw...", "...wwwcww...", ".wwwcwcw....",
  "wwwcwcww....", ".ccwcww.....", "...cwww.....", "...www......", "...w........", "............",
];
const flag = [
  "..nnnnnnnn..", ".nyyyyyyyon.", ".nywyyyyonn.", ".nyyyyyon...", ".nyyyyonn...",
  ".nyyyyyn....", ".noooooon...", ".nnnnnnnn...", ".nn.........", ".nn.........", ".nn.........", "nnnn........",
];
const rover = [
  ".....nn.....", "....nyyn....", ".....nn.....", "..nnnnnnnn..", ".nyyyyoooon.", "nywyyoooooon",
  "nyyyyooonnon", "nyyooonwnwon", ".nooooncncon", ".nnnnnnnnnn.", "..nn....nn..",
];
const heroTop = [
  "...nnnnnnnn...", "..nddddddddn..", ".nddbbbbdbddn.", ".ndbbbbbbdbdn.", "..ndcbcbddddn.", "..nnnnnnnnnnn.",
  "...nstwwwwn...", "...nssndwcn...", "...nssssssn...", "....ntsssn....", "..nnngggnnn...", ".nmdgggggcdn..",
  ".nmdgggggbdsn.", ".nmdgggggddsn.",
];
const boots = {
  idle: ["..nnnndddnnn..", "....nddnddn...", "....nddnddn...", "...nnnnnnnnn..", "...nccnnnccn..", "...nnnnnnnnn.."],
  runA: ["..nnnndddnnn..", "....ndddddn...", "....nddndddn..", "...nddn.ndddn.", "..nccn...nccn.", "..nnn.....nnn."],
  runB: ["..nnnndddnnn..", "...ndddnddn...", "..ndddn.nddn..", ".ndddn...nddn.", ".nccn....nccn.", ".nnn.....nnn.."],
  jump: ["..nnnddddnnn..", "...nddnndddn..", "..ndddn.nccn..", "..nccn...nnn..", "..nnnn........", ".............."],
};

const icons = {
  plane, flag, badge, heart, emptyHeart, star, bottle,
  parcel: [
    "............", "..nnnnnnnn..", ".nooyyoooon.", ".noyyyyooon.", ".nooyyoooon.", ".naaaaaaaan.",
    ".nooooyyyon.", ".nooooywwon.", ".nooooyyyon.", ".naaaaaaaan.", "..nnnnnnnn..",
  ],
  drop: [
    ".....nn.....", "....nrrn....", "....nrrn....", "...nrrrrn...", "..nrwrrrrn..", "..nrwrrrrn..",
    ".nrrrrrrrrn.", ".nrrrrrrrrn.", ".nrrrtrrrrn.", "..nrrrrrrn..", "...nnnnnn...",
  ],
  medal: [
    "..ndn..ndn..", "..ndcnncdn..", "...ndccdn...", "....nccn....",
    "...nnyynn...", "..nyywwyyn..", "..nywyoyyn..", "..nyyyyoyn..", "..noyyyoon..", "...nooon....", "....nnn.....",
  ],
  ticket: [
    "............", ".nnnnnnnnnn.", "npppwpwppppn", "npppwpwpppkn", ".nppwpyppkn.", ".nppwpyppkn.",
    "npppwpwpppkn", "nkkkwkwkkkkn", ".nnnnnnnnnn.", "............",
  ],
  camera: [
    "............", "....nnnn....", ".nnndddnnnn.", "nddcbbbbbbdn", "ndbnnnnbbbdn", "ndnccccnbbdn",
    "ndncwwcnbbdn", "ndnccbbnbbdn", "nddnnnnddddn", ".nnnnnnnnnn.",
  ],
  book: [
    "............", ".nnnn..nnnn.", "nwwwwnnwwwwn", "nwwcwccwcwwn", "nwwwwccwwwwn", "nwccwccwccwn",
    "nwwwwccwwwwn", "nccccddccccn", ".nnnn..nnnn.", "............",
  ],
  paw: [
    "............", "..nn...nn..", ".nggn.nggn.", ".nggn.nggn.", "..nn...nn..", "nn..nnn..nn",
    "ngnngggnngn", ".nnggwwgnn.", "..ngggggn..", "...nnnnn...",
  ],
  wing: [
    "............", "........nn..", "......nncn..", "....nncwcn..", "..nncwwwcn..", ".ncwwwwwdn..",
    ".ndcwwwdn...", "..nddcdn....", "...nnnn.....", "............",
  ],
  pause: ["............","...nn..nn...","..nwwnnwwn..","..nwwnnwwn..","..nwwnnwwn..","..nwwnnwwn..","..nwwnnwwn..","..nwwnnwwn..","..nwwnnwwn..","...nn..nn...","............","............"],
  speaker: ["............","........w...",".....w...w..","....ww...w..","..wwww.w..w.","..wwww..w.w.","..wwww..w.w.","..wwww.w..w.","....ww...w..",".....w...w..","........w...","............"],
  muted: ["............","............",".....w......","....ww.ww.ww","..wwww..www.","..wwww...w..","..wwww..www.","..wwww.ww.ww","....ww......",".....w......","............","............"],
  left: ["............","......w.....",".....ww.....","....wwww....","...wwwww....","..wwwwwwww..","..wwwwwwww..","...wwwww....","....wwww....",".....ww.....","......w.....","............"],
  right: ["............",".....w......",".....ww.....","....wwww....","....wwwww...","..wwwwwwww..","..wwwwwwww..","....wwwww...","....wwww....",".....ww.....",".....w......","............"],
  jump: ["............",".....ww.....","....wwww....","...wwwwww...","..wwwwwwww..","..wwwwwwww..",".....ww.....",".....ww.....",".....ww.....",".....ww.....","............","............"],
};

export type IconName = keyof typeof icons;

function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function pixels(ctx: CanvasRenderingContext2D, sprite: Pixels, x: number, y: number, size: number, flip = false) {
  for (let row = 0; row < sprite.length; row++) {
    const strip = sprite[row];
    for (let col = 0; col < strip.length;) {
      const key = strip[col];
      let end = col + 1;
      while (end < strip.length && strip[end] === key) end++;
      const color = COLORS[key as keyof typeof COLORS];
      if (color) rect(ctx, color, x + (flip ? strip.length - end : col) * size, y + row * size, (end - col) * size, size);
      col = end;
    }
  }
}

export function drawIcon(canvas: HTMLCanvasElement, name: IconName) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, 12, 12);
  pixels(ctx, icons[name], 0, 0, 1);
}

const THEMES = {
  campus: {
    sky: "#589de5", low: "#81b8ed", horizon: "#a0cdf0", cloud: "#e8f5ff", cloudShade: "#b5d8f5",
    city: "#689dd5", cityDark: "#568bc5", trees: "#4e97ac", treeLight: "#70b8bb",
    campus: "#88b9e5", campusLight: "#c1dbf6", window: "#578ecc", roof: "#669ad4",
    earth: "#844b62", edge: "#693e56", stone: "#a35d6c", lightStone: "#bb7482",
    grass: "#498b77", grassLight: "#75c89e", darkGrass: "#2c6e68", pit: "#5895c7",
  },
  park: {
    sky: "#47a7ad", low: "#73c5bc", horizon: "#a0dbca", cloud: "#e6fbf4", cloudShade: "#a9ded9",
    city: "#70b6ab", cityDark: "#55a095", trees: "#438e77", treeLight: "#70b58c",
    campus: "#83baa2", campusLight: "#bce1bf", window: "#59947f", roof: "#69a994",
    earth: "#685261", edge: "#4b4256", stone: "#896973", lightStone: "#9e8186",
    grass: "#438462", grassLight: "#89d49c", darkGrass: "#2c6755", pit: "#437f8e",
  },
  festival: {
    sky: "#696cc1", low: "#9385d4", horizon: "#c5a3de", cloud: "#f1dbff", cloudShade: "#c7ace8",
    city: "#9684c2", cityDark: "#7468a8", trees: "#6964a4", treeLight: "#9381b7",
    campus: "#b596cb", campusLight: "#e2c3e7", window: "#7b6ab3", roof: "#927bbc",
    earth: "#634b71", edge: "#4c3559", stone: "#896085", lightStone: "#a678a1",
    grass: "#758398", grassLight: "#a8c5b4", darkGrass: "#54677e", pit: "#645e9f",
  },
  hangar: {
    sky: "#d78c61", low: "#edb582", horizon: "#f3cb9e", cloud: "#fff0d4", cloudShade: "#eebc95",
    city: "#b58183", cityDark: "#9f6975", trees: "#976c78", treeLight: "#bf9189",
    campus: "#a4889a", campusLight: "#edc7ae", window: "#725e7d", roof: "#826e8a",
    earth: "#604e67", edge: "#493753", stone: "#8b7180", lightStone: "#ac8790",
    grass: "#718f8a", grassLight: "#a8cb9e", darkGrass: "#566b6b", pit: "#aa7883",
  },
  night: {
    sky: "#263668", low: "#354c81", horizon: "#5e729b", cloud: "#7894bd", cloudShade: "#5b73a4",
    city: "#4b628d", cityDark: "#394d76", trees: "#455e80", treeLight: "#647c9e",
    campus: "#6078a0", campusLight: "#bfbed2", window: "#dfae82", roof: "#455d8c",
    earth: "#53445d", edge: "#3c324b", stone: "#775d7c", lightStone: "#a27ba5",
    grass: "#386d73", grassLight: "#7dbdaf", darkGrass: "#35575f", pit: "#3e517b",
  },
};
type Colors = typeof THEMES[Theme];

function cloud(ctx: CanvasRenderingContext2D, theme: Colors, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  rect(ctx, theme.cloudShade, 6, 20, 74, 14);
  rect(ctx, theme.cloudShade, 0, 27, 88, 7);
  rect(ctx, theme.cloud, 9, 17, 67, 11);
  rect(ctx, theme.cloud, 16, 12, 49, 13);
  rect(ctx, theme.cloud, 28, 5, 28, 18);
  rect(ctx, theme.cloud, 35, 0, 15, 12);
  rect(ctx, theme.cloud, 65, 21, 17, 7);
  ctx.restore();
}

const letters = ["#...#.###.#...#", "##.##.#.#.#..##", "#.#.#.###.#.#.#", "#...#.#.#.##..#", "#...#.#.#.#...#"];

function campusBuilding(ctx: CanvasRenderingContext2D, c: Colors, x: number, y: number, tall: boolean) {
  const w = tall ? 216 : 152;
  const h = tall ? 119 : 67;
  const wing = tall ? 50 : 28;
  rect(ctx, c.campus, x, y + 24, w, h + 12);
  rect(ctx, c.campus, x + wing, y, w - wing * 2, h + 34);
  rect(ctx, c.roof, x + wing - 5, y - 8, w - wing * 2 + 10, 9);
  rect(ctx, c.campusLight, x + wing + 5, y - 13, w - wing * 2 - 10, 5);
  rect(ctx, c.roof, x - 3, y + 22, wing + 1, 6);
  rect(ctx, c.roof, x + w - wing + 3, y + 22, wing, 6);
  rect(ctx, c.campusLight, x + 2, y + 29, w - 4, 5);

  for (let wx = 10; wx < w - 12; wx += 22) {
    for (let wy = 42; wy < h + 7; wy += 22) {
      rect(ctx, c.campusLight, x + wx - 2, y + wy, 13, 13);
      rect(ctx, c.window, x + wx, y + wy + 2, 8, 10);
      rect(ctx, c.roof, x + wx, y + wy + 7, 8, 2);
    }
  }

  if (!tall) return;
  for (let row = 0; row < letters.length; row++) {
    for (let col = 0; col < letters[row].length; col++) {
      if (letters[row][col] === "#") rect(ctx, c.window, x + 84 + col * 3, y + 7 + row * 3, 3, 3);
    }
  }
  rect(ctx, c.roof, x + 89, y + 91, 37, 49);
  rect(ctx, c.window, x + 96, y + 100, 24, 42);
  rect(ctx, c.campusLight, x + 81, y + 89, 52, 5);
  rect(ctx, c.campusLight, x + 82, y + 94, 5, 39);
  rect(ctx, c.campusLight, x + 128, y + 94, 5, 39);
}

function tree(ctx: CanvasRenderingContext2D, c: Colors, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  rect(ctx, c.cityDark, 19, 37, 6, 39);
  rect(ctx, c.trees, 6, 14, 33, 40);
  rect(ctx, c.trees, 0, 23, 46, 23);
  rect(ctx, c.trees, 13, 5, 20, 47);
  rect(ctx, c.treeLight, 10, 14, 17, 17);
  rect(ctx, c.treeLight, 13, 9, 17, 7);
  rect(ctx, c.treeLight, 5, 26, 14, 10);
  rect(ctx, c.treeLight, 20, 22, 13, 19);
  rect(ctx, c.treeLight, 7, 40, 9, 3);
  ctx.restore();
}

function hangarBuilding(ctx: CanvasRenderingContext2D, c: Colors, x: number, y: number) {
  rect(ctx, c.roof, x + 19, y - 11, 142, 7);
  rect(ctx, c.roof, x + 8, y - 4, 164, 10);
  rect(ctx, c.campusLight, x + 13, y - 4, 155, 3);
  rect(ctx, c.campus, x, y + 4, 180, 110);
  rect(ctx, c.roof, x + 6, y + 36, 168, 78);
  rect(ctx, c.window, x + 17, y + 43, 146, 71);
  for (let i = 0; i < 6; i++) {
    const rib = x + 13 + i * 28;
    rect(ctx, c.campusLight, rib, y + 13, 17, 10);
    rect(ctx, c.roof, rib + 4, y + 18, 11, 5);
    rect(ctx, c.campus, rib + 5, y + 39, 4, 75);
  }
  rect(ctx, c.campusLight, x + 2, y + 28, 176, 4);
  rect(ctx, c.roof, x - 7, y + 114, 194, 4);
}

function backdrop(ctx: CanvasRenderingContext2D, c: Colors, camera: number, width: number, theme: Theme) {
  rect(ctx, c.sky, 0, 0, width, WORLD_HEIGHT);
  rect(ctx, c.low, 0, 217, width, 215);
  rect(ctx, c.horizon, 0, 282, width, 150);

  const cloudOffset = Math.round(camera * 0.14 / 2) * 2;
  if (theme === "night") {
    for (let i = 0; i < 27; i++) {
      const x = 14 + i * 54 - cloudOffset;
      if (x < 0 || x > width) continue;
      const y = 16 + (i * 47) % 156;
      rect(ctx, i % 4 ? "#a3b9d6" : "#f3e5bc", x, y, i % 4 ? 2 : 4, 2);
    }
    rect(ctx, "#f3e5bc", 152 - cloudOffset, 124, 28, 27);
    rect(ctx, "#f3e5bc", 158 - cloudOffset, 117, 16, 40);
    rect(ctx, c.sky, 166 - cloudOffset, 115, 18, 29);
  }
  for (let i = 0; i < 8; i++) {
    const x = 22 + i * 204 - cloudOffset + (i % 3) * 23;
    if (x + 166 < 0 || x > width) continue;
    cloud(ctx, c, x, 47 + (i % 4) * 31, i % 3 === 0 ? 1.52 : 1.08);
  }

  const offset = Math.round(camera * 0.26 / 2) * 2;
  if (theme === "festival") {
    rect(ctx, "#f1c2ba", 122 - cloudOffset, 153, 54, 50);
    rect(ctx, "#f1c2ba", 130 - cloudOffset, 144, 38, 67);
    rect(ctx, "#f6d6c4", 137 - cloudOffset, 144, 24, 7);
    rect(ctx, "#e5a9b6", 121 - cloudOffset, 181, 56, 4);
    rect(ctx, "#e5a9b6", 124 - cloudOffset, 193, 50, 4);
  }
  for (let i = -1; i < 30; i++) {
    const x = i * 57 - offset;
    if (x + 69 < 0 || x > width) continue;
    const y = 272 - ((i * 71 + 150) % 7) * 9;
    rect(ctx, i % 2 ? c.city : c.cityDark, x, y, 49, 362 - y);
    rect(ctx, c.city, x + 5, y - 5, 41, 6);
    if (i % 3 === 1) rect(ctx, c.cityDark, x + 19, y - 17, 7, 13);
    for (let j = 0; j < 3; j++) rect(ctx, c.city, x + 6 + j * 13, y + 13, 7, 12);
  }

  const near = Math.round(camera * 0.46 / 2) * 2;
  if (theme === "hangar") {
    for (let i = 0; i < 8; i++) {
      const x = 105 + i * 244 - near;
      if (x > -187 && x < width) hangarBuilding(ctx, c, x, 245 + i % 2 * 11);
    }
  } else if (theme !== "park") {
    for (let i = 0; i < 5; i++) {
      const x = 140 + i * 358 - near;
      if (x > -225 && x < width) campusBuilding(ctx, c, x, i % 2 ? 270 : 211, i % 2 === 0);
    }
  } else {
    for (let i = 0; i < 13; i++) {
      const x = i * 117 - near * 0.85;
      if (x > -90 && x < width) tree(ctx, c, x, 186 + i % 4 * 17, 1.85);
    }
  }

  for (let i = -1; i < 25; i++) {
    const x = 3 + i * 69 - near;
    if (x + 64 < 0 || x > width) continue;
    tree(ctx, c, x, 296 - ((i + 3) % 4) * 8, 0.81 + ((i + 3) % 3) * 0.21);
  }
  rect(ctx, c.pit, 0, 358, width, 74);
  rect(ctx, c.cityDark, 0, 411, width, 21);
}

function platform(ctx: CanvasRenderingContext2D, c: Colors, box: Rect, cam: number, width: number) {
  const x = box.x - cam;
  const { y, w, h } = box;
  const isGround = y === GROUND_Y;
  rect(ctx, c.edge, x, y, w, h);
  rect(ctx, isGround ? c.earth : c.stone, x + 3, y + 5, w - 6, h - 9);
  const start = Math.max(0, Math.floor(-x / 32) - 1);
  const end = Math.min(Math.ceil(w / 32), Math.ceil((width - x) / 32) + 1);
  for (let i = start; i < end; i++) {
    const tx = x + i * 32;
    const remaining = Math.min(32, x + w - tx);
    if (remaining <= 5) continue;
    rect(ctx, isGround ? c.stone : c.lightStone, tx + 3, y + (isGround ? 19 : 6), remaining - 5, isGround ? 9 : 5);
    rect(ctx, c.edge, tx + 5, y + (isGround ? 28 : 12), remaining - 6, 2);
    if (!isGround) continue;

    rect(ctx, c.stone, tx + 1, y + 37 + (i % 3) * 2, remaining - 4, 7);
    rect(ctx, c.edge, tx + 6, y + 53, Math.min(remaining - 5, 10), 3);
    rect(ctx, c.stone, tx + 2, y + 61 + (i % 2) * 4, Math.min(remaining - 2, 15), 4);
    rect(ctx, c.grass, tx, y + 2, remaining, 12 + (i % 3) * 2);
    rect(ctx, c.grassLight, tx, y, remaining, 5);
    rect(ctx, c.darkGrass, tx + 1, y + 10, remaining - 2, 3);
    if (i % 3 === 0) {
      rect(ctx, c.grass, tx + 11, y - 5, 4, 6);
      rect(ctx, c.grassLight, tx + 15, y - 9, 4, 10);
    }
    if (i % 6 === 3 && remaining > 19) {
      rect(ctx, c.grass, tx + 24, y - 9, 3, 9);
      rect(ctx, "#ffe099", tx + 22, y - 12, 7, 4);
      rect(ctx, "#fff2d0", tx + 24, y - 13, 3, 3);
    }
  }
}

function sign(ctx: CanvasRenderingContext2D, x: number) {
  const y = GROUND_Y - 42;
  rect(ctx, "#5c5369", x + 13, y + 11, 5, 32);
  rect(ctx, "#233855", x, y, 30, 19);
  rect(ctx, "#4270a1", x + 3, y + 3, 24, 13);
  rect(ctx, "#fff4e0", x + 7, y + 8, 13, 3);
  rect(ctx, "#fff4e0", x + 16, y + 6, 6, 7);
}

function checkpoint(ctx: CanvasRenderingContext2D, x: number, active: boolean) {
  const y = GROUND_Y - 55;
  rect(ctx, "#31546d", x, y, 6, 55);
  rect(ctx, "#abd4e6", x + 2, y, 2, 54);
  rect(ctx, active ? "#6ce6ba" : "#a6bdd5", x + 5, y + 3, 25, 16);
  rect(ctx, active ? "#49b9a2" : "#7e9fbc", x + 5, y + 15, 22, 4);
  rect(ctx, "#e5faf2", x + 9, y + 6, 4, 5);
}

function finish(ctx: CanvasRenderingContext2D, x: number) {
  const y = GROUND_Y - 91;
  rect(ctx, "#243650", x - 3, y, 8, 91);
  rect(ctx, "#e6f4f2", x, y + 2, 3, 89);
  rect(ctx, "#ffe475", x - 3, y - 4, 8, 7);
  pixels(ctx, flag, x - 8, y + 7, 4);
  rect(ctx, "#d0eef0", x - 10, GROUND_Y - 5, 21, 5);
}

export function drawGame(ctx: CanvasRenderingContext2D, game: Game, width: number) {
  const cam = Math.round(game.camera / 2) * 2;
  const { player, mission, time } = game;
  const c = THEMES[mission.theme];
  backdrop(ctx, c, cam, width, mission.theme);

  if (cam < 49) sign(ctx, 20 - cam);
  if (mission.checkpoint.x >= cam - 40 && mission.checkpoint.x <= cam + width) {
    checkpoint(ctx, mission.checkpoint.x - cam, game.checkpoint);
  }
  if (mission.goalX >= cam - 50 && mission.goalX <= cam + width) finish(ctx, mission.goalX - cam);

  for (const solid of mission.platforms) {
    if (solid.x + solid.w < cam || solid.x > cam + width) continue;
    platform(ctx, c, solid, cam, width);
  }

  for (const token of game.tokens) {
    if (token.taken || token.x + 24 < cam || token.x - 24 > cam + width) continue;
    const y = Math.round((token.y + Math.sin(time * 4 + token.x) * 3) / 2) * 2;
    const sparkle = Math.sin(time * 5 + token.x) > 0.62;
    pixels(ctx, icons[mission.icon], token.x - cam - 12, y - 12, 2);
    if (sparkle) {
      rect(ctx, "#fff1bb", token.x - cam + 15, y - 12, 2, 6);
      rect(ctx, "#fff1bb", token.x - cam + 13, y - 10, 6, 2);
    }
  }

  for (const obstacle of game.rovers) {
    if (!obstacle.active || obstacle.x + 28 < cam || obstacle.x > cam + width) continue;
    const bob = Math.floor(time * 12) % 2;
    pixels(ctx, rover, Math.round(obstacle.x) - cam, obstacle.y + 5 - bob, 2, obstacle.vx < 0);
  }

  const { x, y, facing, grounded, vx, invulnerable } = player;
  if (invulnerable === 0 || Math.floor(invulnerable * 12) % 2 === 0) {
    const gait = Math.floor(time * 10) % 2 === 0 ? boots.runA : boots.runB;
    const feet = grounded ? (Math.abs(vx) > 25 ? gait : boots.idle) : boots.jump;
    const px = Math.round((x - cam - 4) / 2) * 2;
    const py = Math.round((y + 2) / 2) * 2;
    pixels(ctx, heroTop, px, py, 2, facing < 0);
    pixels(ctx, feet, px, py + 28, 2, facing < 0);
  }

  for (const particle of game.particles) {
    rect(ctx, particle.color, Math.round(particle.x / 2) * 2 - cam, Math.round(particle.y / 2) * 2, 4, 4);
  }
}
