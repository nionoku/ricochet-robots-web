// eslint-disable-next-line max-classes-per-file
import { round } from '@/utils/round';
import {
  Group, Mesh, MeshStandardMaterial, Object3D, Vec2, Vector3,
} from 'three';
import boardDescription from '@/assets/board.json';
import { Robot } from './Robot';

const BOARD_WIDTH = boardDescription.width;
const BOARD_CENTER = BOARD_WIDTH / 2;
const BOARD_SIZE = BOARD_WIDTH ** 2;
const STEP = boardDescription.step;
const DEVIATION = boardDescription.deviation;

const CENTER_POINTS = boardDescription.center_points;
const CENTER_COORDS = boardDescription.center_coords;
const CENTER_QUADRANT = boardDescription.center_quadrant;
const START_POINT = boardDescription.start_point;
const END_POINT = boardDescription.end_point;

const BOARD_TARGETS = boardDescription.object_targets_name;
const BOARD_ENTITY_WALL = boardDescription.object_wall_name;
const BOARD_ENTITY_CORNER_WALL_CONTAINER = boardDescription.object_corner_wall_container_name;
const BOARD_ENTITY_SIDE_WALL_CONTAINER = boardDescription.object_side_wall_container_name;

const START_WITH_TARGET = boardDescription.target_starts_with;

const TARGETS: Array<string> = boardDescription.targets;

// xxxx - then x is number
// 0 - is blocked, 1 - is free
// xxxx[0] - left
// xxxx[1] - top
// xxxx[2] - right
// xxxx[3] - bottom
type Directions = number

export enum Direction {
  LEFT,
  TOP,
  RIGHT,
  BOTTOM
}

class Builder {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected boardParts: Array<Object3D>,
  ) {}

  public make(): Group {
    const board = new Group();
    const parts = this.boardParts.sort(() => Math.random() - 0.5);
    parts.forEach((it, index) => {
      it.rotation.set(0, index * (Math.PI / 2), 0);
      it.position.set(
        // 0: 4, 1: 4, 2: -4, 3: -4
        index < 2 ? 4 : -4,
        0,
        // 0: 4, 1: -4, 2: -4, 3: 4
        index % 3 ? -4 : 4,
      );

      // rotate icons
      // eslint-disable-next-line no-unused-expressions
      it.getObjectByName(BOARD_TARGETS)
        ?.children
        .forEach((icon) => {
          icon.rotation.set(icon.rotation.x, 0, index * (Math.PI / 2) * -1);
        });
    });

    board.add(...parts);

    // update walls material
    const wallMaterials = boardDescription.wall.colors
      .map((it) => new MeshStandardMaterial({ color: it }));

    board.traverse((it) => {
      if (it.name === BOARD_ENTITY_WALL) {
        const box: Mesh = it as Mesh;
        box.material = wallMaterials;
        box.geometry.groups.forEach((geometry) => {
          // eslint-disable-next-line no-param-reassign
          geometry.materialIndex = 0;
        });

        box.geometry
          .groups[2]
          .materialIndex = 1;
      }
    });

    return board;
  }
}

export class Board {
  public static Builder = Builder

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
    protected _boardParts: Object3D,
  ) {
    _boardParts.traverse((it) => {
      const position = this.vector3ToVec2(it.getWorldPosition(new Vector3()));

      // exclude targets from initial places
      if (this.isTarget(it)) {
        const coords = this.coordsByPosition({
          x: position.x,
          y: position.y,
        });
        const indexOfCell = this._availablePositions
          .findIndex(({ x, y }) => x === coords.x && y === coords.y);

        if (indexOfCell > -1) {
          this._availablePositions.splice(indexOfCell, 1);
        }
      }

      if (this.isWall(it)) {
        this._wallsCoords.push({
          x: round(position.x, 10),
          y: round(position.y, 10),
        });
      }
    });

    // fill center quadrant
    this._wallsCoords.push(...CENTER_QUADRANT);
  }

  public updateRobot(robot: Robot): void {
    const existRobotId = this._robots.findIndex((it) => it.uuid === robot.uuid);

    if (existRobotId) {
      this._robots.splice(existRobotId, 1);
    }

    this._robots.push(robot);
  }

  public set robots(robots: Array<Robot>) {
    this._robots = robots;
  }

  public generateAvailablePositions(count: number): Array<Vec2> {
    const availablePositions: Array<Vec2> = [...this._availablePositions];
    const positions: Array<Vec2> = [];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * availablePositions.length);
      positions.push(
        this.positionByCoords(availablePositions.splice(index, 1)[0]),
      );
    }

    return positions;
  }

  /**
   * @returns position after move
   */
  public move(
    robot: Robot,
    direction: Direction,
  ): Vec2 {
    const shift = 3 - direction;
    const directionBinary = 2 ** shift;
    const matrix = this.calcBoardMatrix(
      this._robots.filter((it) => it.uuid !== robot.uuid),
    );
    let { x, y } = this.coordsByPosition(robot.position);

    while (((directionBinary & matrix[y][x]) >> shift) & 1) {
      switch (direction) {
        case Direction.LEFT: {
          x--;
          break;
        }

        case Direction.TOP: {
          y--;
          break;
        }

        case Direction.RIGHT: {
          x++;
          break;
        }

        case Direction.BOTTOM: {
          y++;
          break;
        }

        default: {
          break;
        }
      }
    }

    return this.positionByCoords({ x, y });
  }

  public coordsByPosition({ x, y }: Vec2): Vec2 {
    return {
      x: round(BOARD_CENTER + (x - DEVIATION), 10),
      y: round(BOARD_CENTER + (y - DEVIATION), 10),
    };
  }

  public positionByCoords({ x, y }: Vec2): Vec2 {
    return {
      x: round((x + DEVIATION) - BOARD_CENTER, 10),
      y: round((y + DEVIATION) - BOARD_CENTER, 10),
    };
  }

  public get object(): Object3D {
    return this._boardParts;
  }

  protected calcBoardMatrix(robots: Array<Robot> = this._robots): Array<Array<Directions>> {
    const matrix: Array<Array<Directions>> = [];
    // fill walls coords and robots coords
    const wallsCoords: Array<Vec2> = [
      ...this._wallsCoords,
      ...robots.map((it) => it.position),
    ];

    for (let { y } = START_POINT; y <= END_POINT.y; y += STEP) {
      matrix.push([]);

      for (let { x } = START_POINT; x <= END_POINT.x; x += STEP) {
        // start with 1111
        let cellDirections = 15;

        if (
          (CENTER_POINTS.includes(x) && CENTER_POINTS.includes(y))
            || wallsCoords.find((it) => it.x === x && it.y === y)
        ) {
          cellDirections = 0;
        }

        // bottom
        if (
          (y === END_POINT.y)
            || (wallsCoords.find((it) => it.x === x && it.y === y + DEVIATION))
            || (wallsCoords.find((it) => it.x === x && it.y === y + STEP))
        ) {
          cellDirections &= 14;
        }

        // right
        if (
          (x === END_POINT.x)
            || (wallsCoords.find((it) => it.x === x + DEVIATION && it.y === y))
            || (wallsCoords.find((it) => it.x === x + STEP && it.y === y))
        ) {
          cellDirections &= 13;
        }

        // top
        if (
          (y === START_POINT.y)
            || (wallsCoords.find((it) => it.x === x && it.y === y - DEVIATION))
            || (wallsCoords.find((it) => it.x === x && it.y === y - STEP))
        ) {
          cellDirections &= 11;
        }

        // left
        if (
          (x === START_POINT.x)
            || (wallsCoords.find((it) => it.x === x - DEVIATION && it.y === y))
            || (wallsCoords.find((it) => it.x === x - STEP && it.y === y))
        ) {
          cellDirections &= 7;
        }

        matrix[matrix.length - 1].push(cellDirections);
      }
    }

    return matrix;
  }

  protected vector3ToVec2({ x, z }: Vector3): Vec2 {
    return { x, y: z };
  }

  protected isTarget({ name }: Object3D): boolean {
    return name.startsWith(START_WITH_TARGET)
      && TARGETS.includes(name);
  }

  protected isWall({ name, parent }: Object3D): boolean {
    return name === BOARD_ENTITY_WALL && (
      parent?.name === BOARD_ENTITY_CORNER_WALL_CONTAINER
        || parent?.name === BOARD_ENTITY_SIDE_WALL_CONTAINER
    );
  }
}
