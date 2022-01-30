import { round } from '@/utils/round';
import { Object3D, Vec2, Vector3 } from 'three';
import { Robot } from './Robot';

const BOARD_WIDTH = 16;
const BOARD_CENTER = BOARD_WIDTH / 2;
const BOARD_SIZE = BOARD_WIDTH ** 2;
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

  protected _availablePositions: Array<Vec2> = Array
    .from({ length: BOARD_SIZE }, (_, i) => ({
      x: i % BOARD_WIDTH,
      y: Math.floor(i / BOARD_WIDTH),
    }))
    // exclude center
    .filter(({ x, y }) => !(CENTER_COORDS.includes(x) && CENTER_COORDS.includes(y)));

  protected _robots: Array<Robot> = []

  constructor(
    boardParts: Object3D,
  ) {
    boardParts.traverse((it) => {
      // exclude targets from initial places
      if (it.name.startsWith('target') && TARGETS.includes(it.name as Target)) {
        const position = it.getWorldPosition(new Vector3());
        const coords = this.coordsByPosition({ x: position.x, y: position.z });
        const indexOfCell = this._availablePositions
          .findIndex(({ x, y }) => x === coords.x && y === coords.y);

        if (indexOfCell > -1) {
          this._availablePositions.splice(indexOfCell, 1);
        }
      }

      if (
        it.name === BOARD_ENTITY_WALL && (
          it.parent?.name === BOARD_ENTITY_CORNER_WALL_CONTAINER
            || it.parent?.name === BOARD_ENTITY_SIDE_WALL_CONTAINER
        )
      ) {
        const position = it.getWorldPosition(new Vector3());
        this._wallsCoords.push({
          x: round(position.x, 10),
          y: round(position.z, 10),
        });
      }
    });

    // fill center quadrant
    this._wallsCoords.push(...[
      { x: -0.5, y: -1 },
      { x: 0.5, y: -1 },
      { x: -0.5, y: 1 },
      { x: 0.5, y: 1 },
      { x: -1, y: -0.5 },
      { x: -1, y: 0.5 },
      { x: 1, y: -0.5 },
      { x: 1, y: 0.5 },
    ]);
  }

  protected coordsByPosition({ x, y }: Vec2): Vec2 {
    throw new Error('Not implemented');
  }

  protected positionByCoords({ x, y }: Vec2): Vec2 {
    throw new Error('Not implemented');
  }
}
