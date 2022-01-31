// eslint-disable-next-line max-classes-per-file
import {
  Camera, Raycaster, Scene, Vec2,
} from 'three';
import { Arrow, calcArrowsPositions } from './Arrow';
import { Board } from './Board';
import { Robot } from './Robot';

export interface Intersector<E extends Event> {
  // Pick<WindowEventMap, 'click' | 'mouseover'>
  event: keyof WindowEventMap
  listener: (event: E) => any
  onIntersect?: (uuid: string) => void
  watch(): void
  cancel(): void
}

abstract class BaseMouseIntersector implements Intersector<MouseEvent> {
  public readonly listener: (event: MouseEvent) => any

  public onIntersect?: (uuid: string) => void

  constructor(
    raycaster: Raycaster,
    camera: Camera,
    scene: Scene,
    public event: keyof Pick<WindowEventMap, 'click'>,
  ) {
    this.listener = (event: MouseEvent) => {
      const [clickX, clickY] = [
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 * -1 + 1,
      ];

      raycaster.setFromCamera({ x: clickX, y: clickY }, camera);

      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
          // eslint-disable-next-line no-unused-expressions
          this.onIntersect?.(intersects[0].object.uuid);
      }
    };
  }

  public setOnIntersect(onIntersect: (uuid: string) => void): void {
    this.onIntersect = onIntersect;
  }

  public watch(): void {
    window.addEventListener(this.event, this.listener);
  }

  public cancel(): void {
    window.removeEventListener(this.event, this.listener);
  }
}
class ClickIntersector extends BaseMouseIntersector {
  constructor(raycaster: Raycaster, camera: Camera, scene: Scene) {
    super(raycaster, camera, scene, 'click');
  }
}

class Controlls {
  protected _selectedRobot: Robot | null = null

  protected readonly _movesHistory: Array<{ uuid: string, position: Vec2 }> = []

  protected readonly _initialPositions: Array<{ uuid: string, position: Vec2 }> = []

  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected readonly _board: Board,
    protected readonly _robots: Array<Robot>,
    protected readonly _arrows: Array<Arrow>,
  ) {}

  public whenIntersectByClick(uuid: string): void {
    const intersectedRobot = this._robots.find((it) => it.uuid === uuid);

    if (intersectedRobot) {
      return this.onIntersectRobot(intersectedRobot);
    }

    const intersectedArrow = this._arrows.find((it) => it.uuid === uuid);

    if (intersectedArrow) {
      return this.onIntersectArrow(intersectedArrow);
    }

    this.hideArrows();
    // enable iddle animation for each robot
    this._robots
      .forEach((it) => it.keepIddleAnimation());
    // forgot selected robot
    this._selectedRobot = null;

    return undefined;
  }

  public whenKeypress(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case 32: {
        const index = this._robots.findIndex((it) => it.uuid === this._selectedRobot?.uuid);
        const validatedIndex = (index + 1) < this._robots.length
          ? index + 1
          : 0;

        return this.onIntersectRobot(this._robots[validatedIndex]);
      }

      case 37:
      case 38:
      case 39:
      case 40: {
        if (this._selectedRobot) {
          // like as left, up, right, down
          const direction = Math.abs(37 - event.keyCode);
          const likeAsIntersectedArrow = this._arrows.find((it) => it.direction === direction);

          if (likeAsIntersectedArrow) {
            return this.onIntersectArrow(likeAsIntersectedArrow);
          }
        }

        break;
      }

      default:
    }

    return undefined;
  }

  public undoLastMove(): void {
    const lastMove = this._movesHistory.pop();

    if (!lastMove) {
      return;
    }

    const lastMovedRobot = this._robots.find(({ uuid }) => lastMove.uuid === uuid);

    if (!lastMovedRobot) {
      return;
    }

    this.hideArrows();
    this._selectedRobot = lastMovedRobot;
    this._selectedRobot.position = lastMove.position;
    this.showAvailableArrows(this._selectedRobot);
  }

  public get hasUndoLastMove(): boolean {
    return this._movesHistory.length > 0;
  }

  public makeTurn(): void {
    this._selectedRobot = null;
    this._movesHistory.splice(0);
    this._initialPositions.splice(0);
    this._initialPositions.push(
      ...this._robots.map(({ uuid, position }) => ({
        uuid,
        position,
      })),
    );
  }

  protected onIntersectArrow(arrow: Arrow): void {
    if (this._selectedRobot) {
      this.hideArrows();
      // push previous step
      this._movesHistory.push({
        uuid: this._selectedRobot.uuid,
        position: this._selectedRobot.position,
      });

      const finishPoint = this._board.move(this._selectedRobot, arrow.direction);
      this._selectedRobot.position = finishPoint;

      this.showAvailableArrows(this._selectedRobot);
    }
  }

  protected onIntersectRobot(robot: Robot): void {
    this._selectedRobot = robot;

    robot.cancelIddleAnimation();

    this.showAvailableArrows(robot);

    // enable iddle animation for other robots
    this._robots
      .filter((it) => it.uuid !== robot.uuid && !it.hasIddleAnimation)
      .forEach((it) => it.keepIddleAnimation());
  }

  protected hideArrows(): void {
    // hide arrows
    this._arrows.forEach((it) => {
      // eslint-disable-next-line no-param-reassign
      it.visible = false;
    });
  }

  protected showAvailableArrows(robot: Robot): void {
    const directions = this._board.availableDirections(robot);

    this._arrows.forEach((it) => {
      if (directions.includes(it.direction)) {
        const position = calcArrowsPositions(robot)
          .find(({ direction }) => direction === it.direction)
          ?.position;

        if (position) {
          // eslint-disable-next-line no-param-reassign
          it.position = position;
          // eslint-disable-next-line no-param-reassign
          it.visible = true;
        }
      } else {
        // eslint-disable-next-line no-param-reassign
        it.visible = false;
      }
    });
  }
}

export class Game {
  public static readonly Controlls = Controlls

  public static readonly ClickIntersector = ClickIntersector
}
