export interface Rect { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }
interface RoverData { x: number; min: number; max: number; speed: number }
export type Theme = "campus" | "park" | "festival" | "hangar" | "night";
export type TokenKind = "badge" | "bottle" | "star" | "parcel" | "drop" | "medal" | "ticket" | "camera" | "book" | "paw" | "wing";

export interface Mission {
  theme: Theme;
  icon: TokenKind;
  topic: string;
  title: string;
  story: string;
  task: string;
  width: number;
  platforms: Rect[];
  tokens: Point[];
  rovers: RoverData[];
  checkpoint: Point;
  goalX: number;
}

export const GROUND_Y = 358;

const ground = (x: number, w: number): Rect => ({ x, y: GROUND_Y, w, h: 150 });
const ledge = (x: number, y: number, w: number): Rect => ({ x, y, w, h: 22 });
const token = (x: number, y = 333): Point => ({ x, y });
const rover = (x: number, min: number, max: number, speed: number): RoverData => ({ x, min, max, speed });

export const MISSIONS: Mission[] = [
  {
    theme: "campus",
    icon: "badge",
    topic: "Событийное волонтёрство",
    title: "Встречаем гостей",
    story: "Волонтёры МАИ помогают проводить фестивали и форумы. На таких площадках можно познакомиться с командой и увидеть, как большое событие устроено изнутри.",
    task: "Собери бейджи для команды и доберись до флага.",
    width: 1936,
    platforms: [
      ground(0, 628), ground(714, 511), ground(1321, 615),
      ledge(252, 280, 112), ledge(405, 235, 96), ledge(543, 284, 80),
      ledge(811, 280, 112), ledge(1060, 276, 112), ledge(1434, 278, 120),
    ],
    tokens: [token(154), token(303, 255), token(454, 210), token(866, 255), token(1132, 250), token(1510, 252)],
    rovers: [{ x: 504, min: 488, max: 581, speed: 47 }, { x: 1028, min: 965, max: 1144, speed: 53 }],
    checkpoint: { x: 768, y: GROUND_Y },
    goalX: 1842,
  },
  {
    theme: "park",
    icon: "bottle",
    topic: "Экологическое волонтёрство",
    title: "Чистый маршрут",
    story: "Экологическое добровольчество в МАИ включает акции и просветительские проекты. Например, волонтёры помогают жителям разобраться в сортировке отходов и бережнее относиться к городской среде.",
    task: "Подбери вторсырьё по пути к флагу.",
    width: 2100,
    platforms: [
      ground(0, 472), ground(572, 383), ground(1057, 444), ground(1608, 492),
      ledge(222, 281, 122), ledge(386, 239, 88), ledge(650, 280, 113),
      ledge(824, 272, 94), ledge(1137, 270, 105), ledge(1340, 271, 130), ledge(1754, 268, 140),
    ],
    tokens: [token(140), token(283, 254), token(437, 213), token(701, 255), token(1190, 243), token(1392, 244), token(1818, 241)],
    rovers: [{ x: 396, min: 339, max: 445, speed: 58 }, { x: 808, min: 756, max: 919, speed: 63 }, { x: 1680, min: 1650, max: 1740, speed: 60 }],
    checkpoint: { x: 1094, y: GROUND_Y },
    goalX: 2010,
  },
  {
    theme: "festival",
    icon: "star",
    topic: "Волонтёрская команда",
    title: "Большое дело",
    story: "В Волонтёрском центре МАИ можно предложить свой проект и набраться опыта в команде. У активных участников есть программа лояльности со специальными проектами и экскурсиями.",
    task: "Собери знаки команды и доберись до флага.",
    width: 2320,
    platforms: [
      ground(0, 531), ground(638, 432), ground(1182, 428), ground(1721, 599),
      ledge(195, 278, 115), ledge(348, 236, 116), ledge(710, 275, 103), ledge(879, 224, 118),
      ledge(1230, 278, 131), ledge(1452, 271, 104), ledge(1835, 280, 112), ledge(1995, 228, 116),
    ],
    tokens: [token(137), token(247, 252), token(403, 208), token(762, 249), token(938, 197), token(1300, 250), token(1887, 253), token(2051, 201)],
    rovers: [{ x: 481, min: 431, max: 510, speed: 63 }, { x: 832, min: 796, max: 1025, speed: 73 }, { x: 1495, min: 1410, max: 1575, speed: 69 }, { x: 2032, min: 1965, max: 2167, speed: 71 }],
    checkpoint: { x: 1203, y: GROUND_Y },
    goalX: 2220,
  },
  {
    theme: "campus",
    icon: "parcel",
    topic: "Социальное волонтёрство",
    title: "Адрес помощи",
    story: "Социальные волонтёры МАИ помогают детям, ветеранам и другим людям, которым нужна поддержка. В команду можно прийти и с небольшой задачей, например помочь подготовить вещи к передаче.",
    task: "Подбери посылки и донеси их до флага.",
    width: 1740,
    platforms: [
      ground(0, 510), ground(612, 528), ground(1234, 506),
      ledge(218, 285, 153), ledge(411, 257, 102), ledge(657, 277, 131),
      ledge(962, 240, 126), ledge(1324, 271, 187),
    ],
    tokens: [token(143), token(291, 259), token(474, 231), token(730, 251), token(1024, 214), token(1420, 245)],
    rovers: [rover(448, 405, 473, 54), rover(925, 861, 987, 60), rover(1567, 1530, 1624, 64)],
    checkpoint: { x: 715, y: GROUND_Y },
    goalX: 1660,
  },
  {
    theme: "campus",
    icon: "drop",
    topic: "Донорские акции",
    title: "День донора",
    story: "В МАИ проходили донорские акции. Волонтёры помогают проводить такие дни и рассказывают участникам, как подготовиться к сдаче крови. В этой команде можно помогать и с организацией.",
    task: "Собери памятки с символом капли по пути к флагу.",
    width: 1790,
    platforms: [
      ground(0, 355), ground(446, 441), ground(997, 268), ground(1366, 424),
      ledge(196, 280, 106), ledge(343, 265, 128), ledge(541, 246, 130),
      ledge(747, 280, 122), ledge(1041, 255, 129), ledge(1342, 282, 118), ledge(1518, 238, 141),
    ],
    tokens: [token(139), token(254, 254), token(412, 239), token(600, 220), token(806, 254), token(1102, 229), token(1589, 212)],
    rovers: [rover(731, 693, 819, 63), rover(1204, 1168, 1228, 60), rover(1518, 1458, 1579, 60)],
    checkpoint: { x: 1012, y: GROUND_Y },
    goalX: 1700,
  },
  {
    theme: "park",
    icon: "medal",
    topic: "Спортивное волонтёрство",
    title: "Большой старт",
    story: "На соревнованиях волонтёры помогают участникам и зрителям ориентироваться на площадке. На международных стартах пригодится иностранный язык, а знание правил спорта поможет отвечать на вопросы.",
    task: "Подбери медали вдоль полосы препятствий.",
    width: 2010,
    platforms: [
      ground(0, 406), ground(518, 345), ground(971, 330), ground(1415, 595),
      ledge(219, 296, 111), ledge(351, 245, 74), ledge(590, 283, 158),
      ledge(991, 287, 109), ledge(1163, 225, 112), ledge(1500, 280, 118), ledge(1730, 267, 153),
    ],
    tokens: [token(135), token(274, 269), token(388, 219), token(665, 256), token(1044, 261), token(1228, 199), token(1795, 241)],
    rovers: [rover(349, 324, 375, 63), rover(794, 738, 830, 70), rover(1246, 1205, 1271, 67), rover(1665, 1586, 1728, 69)],
    checkpoint: { x: 1419, y: GROUND_Y },
    goalX: 1916,
  },
  {
    theme: "festival",
    icon: "ticket",
    topic: "Культурное волонтёрство",
    title: "Культурная смена",
    story: "Арт-волонтёры помогают культурным площадкам проводить выставки, показы и другие события. На такой смене можно попробовать себя в работе с гостями и увидеть, как готовят программу.",
    task: "Собери билеты на пути к площадке.",
    width: 1850,
    platforms: [
      ground(0, 550), ground(674, 430), ground(1241, 609),
      ledge(168, 286, 100), ledge(300, 233, 86), ledge(428, 182, 113), ledge(564, 264, 94),
      ledge(798, 274, 97), ledge(945, 229, 108), ledge(1092, 294, 125), ledge(1424, 256, 140),
    ],
    tokens: [token(218, 260), token(343, 207), token(480, 156), token(615, 238), token(842, 248), token(999, 203), token(1496, 230)],
    rovers: [rover(511, 439, 521, 58), rover(931, 904, 1036, 71), rover(1595, 1504, 1663, 70)],
    checkpoint: { x: 719, y: GROUND_Y },
    goalX: 1756,
  },
  {
    theme: "night",
    icon: "camera",
    topic: "Медиаволонтёрство",
    title: "Кампус в кадре",
    story: "Медиаволонтёры снимают события, пишут тексты и делают графику для проектов. Можно потренироваться в фотографии или дизайне и собрать работы для портфолио.",
    task: "Собери камеры на верхних площадках и доберись до флага.",
    width: 1960,
    platforms: [
      ground(0, 430), ground(571, 459), ground(1166, 369), ground(1644, 316),
      ledge(174, 281, 104), ledge(321, 231, 107), ledge(456, 272, 89), ledge(618, 230, 115),
      ledge(826, 279, 111), ledge(1061, 295, 88), ledge(1315, 246, 121), ledge(1720, 263, 107),
    ],
    tokens: [token(222, 255), token(373, 205), token(499, 246), token(679, 204), token(887, 253), token(1370, 220), token(1775, 237)],
    rovers: [rover(368, 319, 400, 70), rover(845, 780, 960, 69), rover(1353, 1268, 1435, 68)],
    checkpoint: { x: 1172, y: GROUND_Y },
    goalX: 1872,
  },
  {
    theme: "campus",
    icon: "book",
    topic: "Исторические проекты",
    title: "Маршрут памяти",
    story: "Волонтёры МАИ помогают ветеранам, ухаживают за памятными местами и проводят исторические квесты. В такой команде можно узнать больше об истории города и поделиться ею с другими.",
    task: "Подбери карточки с подсказками для исторического квеста.",
    width: 1950,
    platforms: [
      ground(0, 512), ground(625, 326), ground(1055, 359), ground(1550, 400),
      ledge(187, 265, 120), ledge(390, 284, 145), ledge(549, 247, 92),
      ledge(756, 272, 145), ledge(1119, 265, 131), ledge(1328, 281, 119), ledge(1564, 245, 133),
    ],
    tokens: [token(119), token(248, 239), token(476, 258), token(594, 221), token(826, 246), token(1185, 239), token(1630, 219)],
    rovers: [rover(350, 317, 437, 64), rover(833, 754, 920, 68), rover(1314, 1250, 1380, 68), rover(1731, 1695, 1831, 73)],
    checkpoint: { x: 1062, y: GROUND_Y },
    goalX: 1870,
  },
  {
    theme: "park",
    icon: "paw",
    topic: "Помощь приютам",
    title: "Лапки доброты",
    story: "Во время «Недели добра» волонтёры МАИ собирали вещи для приюта и помогали выгуливать и социализировать собак. В подобных акциях можно участвовать и без опыта ухода за животными, взяв задачу по сбору вещей.",
    task: "Собери метки с лапками. Через широкий провал ведёт мостик.",
    width: 2090,
    platforms: [
      ground(0, 496), ground(704, 368), ground(1182, 438), ground(1748, 342),
      ledge(204, 283, 114), ledge(535, 289, 129), ledge(777, 265, 128),
      ledge(970, 214, 91), ledge(1243, 283, 130), ledge(1444, 233, 133),
      ledge(1650, 285, 97), ledge(1816, 266, 101),
    ],
    tokens: [token(134), token(264, 257), token(603, 263), token(840, 239), token(1007, 188), token(1312, 257), token(1519, 207), token(1861, 240)],
    rovers: [rover(417, 367, 466, 65), rover(867, 786, 941, 68), rover(1496, 1434, 1548, 72)],
    checkpoint: { x: 726, y: GROUND_Y },
    goalX: 2010,
  },
  {
    theme: "hangar",
    icon: "wing",
    topic: "Знакомство с университетом",
    title: "Открытые двери",
    story: "Волонтёры МАИ помогают проводить Дни открытых дверей. Встречая будущих студентов и направляя их к нужным площадкам, можно научиться быстро отвечать на вопросы и лучше узнать кампус.",
    task: "Подбери значки для экскурсии и пройди маршрут до ангара.",
    width: 2150,
    platforms: [
      ground(0, 450), ground(565, 430), ground(1155, 395), ground(1680, 470),
      ledge(201, 285, 125), ledge(386, 240, 107), ledge(518, 292, 109),
      ledge(735, 264, 134), ledge(969, 278, 141), ledge(1250, 267, 96),
      ledge(1412, 217, 101), ledge(1728, 280, 128), ledge(1930, 242, 116),
    ],
    tokens: [token(145), token(267, 259), token(442, 214), token(795, 238), token(1040, 252), token(1295, 241), token(1463, 191), token(1987, 216)],
    rovers: [rover(804, 683, 868, 72), rover(1368, 1283, 1488, 73), rover(1833, 1746, 1914, 76)],
    checkpoint: { x: 1172, y: GROUND_Y },
    goalX: 2073,
  },
  {
    theme: "hangar",
    icon: "book",
    topic: "Подготовка волонтёров",
    title: "Школа волонтёра",
    story: "МАИ проводил Школу волонтёра, где студенты знакомились с разными направлениями добровольчества и общались с организаторами проектов. Такой формат помогает выбрать роли, которые хочется попробовать.",
    task: "Собери карточки заданий. К верхним площадкам ведут ступени.",
    width: 1970,
    platforms: [
      ground(0, 484), ground(608, 429), ground(1212, 357), ground(1699, 271),
      ledge(181, 290, 91), ledge(315, 236, 83), ledge(444, 180, 78), ledge(568, 244, 124),
      ledge(779, 283, 126), ledge(943, 231, 94), ledge(1064, 281, 116), ledge(1238, 234, 116),
      ledge(1445, 264, 142), ledge(1731, 283, 117),
    ],
    tokens: [token(226, 264), token(353, 210), token(481, 154), token(625, 218), token(840, 257), token(991, 205), token(1120, 255), token(1290, 208), token(1791, 257)],
    rovers: [rover(428, 379, 450, 67), rover(878, 804, 967, 74), rover(1487, 1403, 1535, 76)],
    checkpoint: { x: 1218, y: GROUND_Y },
    goalX: 1892,
  },
  {
    theme: "night",
    icon: "wing",
    topic: "Студенческие инициативы",
    title: "Своя инициатива",
    story: "Центр развития добровольчества МАИ поддерживает студенческие инициативы. Обсуди идею с командой, распредели роли и попробуй провести первую акцию.",
    task: "Подбери детали проекта. Широкую яму можно пересечь по двум платформам.",
    width: 2360,
    platforms: [
      ground(0, 533), ground(676, 404), ground(1350, 390), ground(1870, 490),
      ledge(180, 284, 115), ledge(367, 228, 107), ledge(556, 270, 88),
      ledge(734, 247, 128), ledge(935, 288, 117), ledge(1112, 286, 87),
      ledge(1221, 235, 100), ledge(1385, 268, 119), ledge(1580, 224, 106), ledge(1898, 260, 120), ledge(2111, 246, 133),
    ],
    tokens: [token(140), token(234, 258), token(420, 202), token(790, 221), token(997, 262), token(1157, 260), token(1275, 209), token(1625, 198), token(2183, 220)],
    rovers: [rover(453, 382, 499, 69), rover(896, 813, 946, 76), rover(1593, 1511, 1686, 76), rover(2006, 1929, 2077, 79)],
    checkpoint: { x: 1361, y: GROUND_Y },
    goalX: 2275,
  },
  {
    theme: "festival",
    icon: "star",
    topic: "Как присоединиться",
    title: "Фестиваль добра",
    story: "Чтобы присоединиться к движению, можно прийти в Волонтёрский центр МАИ и заполнить анкету. В команде можно начать с одной смены: выбрать событие или направление, которое тебе интересно.",
    task: "Пройди финальный маршрут и собери звёзды команды.",
    width: 2440,
    platforms: [
      ground(0, 448), ground(582, 437), ground(1262, 423), ground(1857, 583),
      ledge(190, 280, 94), ledge(327, 228, 109), ledge(470, 277, 87), ledge(630, 235, 108),
      ledge(803, 281, 127), ledge(1039, 289, 93), ledge(1152, 240, 96),
      ledge(1321, 282, 88), ledge(1454, 232, 95), ledge(1598, 180, 119),
      ledge(1745, 269, 82), ledge(1943, 282, 112), ledge(2101, 227, 136),
    ],
    tokens: [token(238, 254), token(383, 202), token(513, 251), token(683, 209), token(869, 255), token(1197, 214), token(1504, 206), token(1654, 154), token(2158, 201)],
    rovers: [rover(379, 342, 421, 76), rover(776, 735, 907, 76), rover(1498, 1380, 1598, 83), rover(2140, 2003, 2250, 83)],
    checkpoint: { x: 1268, y: GROUND_Y },
    goalX: 2353,
  },
];
