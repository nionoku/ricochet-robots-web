import { Vec2 } from 'three';

const BOARD_WIDTH = 16;
const BOARD_CENTER = BOARD_WIDTH / 2;
const BOARD_LENGTH = BOARD_WIDTH ** 2;
const STEP = 1;
const DEVIATION = 0.5;

const CENTER_POINTS = [0.5, -0.5];
const CENTER_COORDS = [7, 8];
const START_POINT = -7.5;
const END_POINT = 7.5;

export const BOARD_ENTITY_WALL = 'Box';
const BOARD_ENTITY_CORNER_WALL_CONTAINER = 'Corner wall';
const BOARD_ENTITY_SIDE_WALL_CONTAINER = 'Side walls';

enum Target {
  BLACKHOLE = 'target_blackhole',
  BLUE_CROSS = 'target_blue_cross',
  BLUE_GEAR = 'target_blue_gear',
  BLUE_MOON = 'target_blue_moon',
  BLUE_PLANET = 'target_blue_planet',

  GREEN_CROSS = 'target_green_cross',
  GREEN_GEAR = 'target_green_gear',
  GREEN_MOON = 'target_green_moon',
  GREEN_PLANET = 'target_green_planet',

  RED_CROSS = 'target_red_cross',
  RED_GEAR = 'target_red_gear',
  RED_MOON = 'target_red_moon',
  RED_PLANET = 'target_red_planet',

  YELLOW_CROSS = 'target_yellow_cross',
  YELLOW_GEAR = 'target_yellow_gear',
  YELLOW_MOON = 'target_yellow_moon',
  YELLOW_PLANET = 'target_yellow_planet',
}

const TARGETS: Array<Target> = [
  Target.BLACKHOLE,
  Target.BLUE_CROSS,
  Target.BLUE_GEAR,
  Target.BLUE_MOON,
  Target.BLUE_PLANET,
  Target.GREEN_CROSS,
  Target.GREEN_GEAR,
  Target.GREEN_MOON,
  Target.GREEN_PLANET,
  Target.RED_CROSS,
  Target.RED_GEAR,
  Target.RED_MOON,
  Target.RED_PLANET,
  Target.YELLOW_CROSS,
  Target.YELLOW_GEAR,
  Target.YELLOW_MOON,
  Target.YELLOW_PLANET,
];

export class Board {
  protected _wallsCoords: Array<Vec2> = []
}
