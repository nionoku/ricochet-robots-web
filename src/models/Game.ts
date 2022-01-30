// eslint-disable-next-line max-classes-per-file
import { Camera, Raycaster, Scene } from 'three';
import { Robot } from './Robot';

export interface Intersector {
  watch(): void
  cancel(): void
}

class ClickIntersector implements Intersector {
  protected listener: (event: MouseEvent) => any

  protected onIntersect?: (uuid: string) => void

  constructor(
    raycaster: Raycaster,
    camera: Camera,
    scene: Scene,
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

  public watch(): void {
    window.addEventListener('click', this.listener);
  }

  public cancel(): void {
    window.removeEventListener('click', this.listener);
  }

  public setOnIntersect(onIntersect: (uuid: string) => void): void {
    this.onIntersect = onIntersect;
  }
}

class Controlls {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected _robots: Array<Robot>,
  ) {}

  public onIntersectByClick(uuid: string): void {
    // TODO (2022.01.31): Replace logic
    const intersectedRobot = this._robots.find((it) => it.uuid === uuid);

    if (intersectedRobot) {
      intersectedRobot.cancelIddleAnimation();
    }
  }
}

export class Game {
  public static Controlls = Controlls

  public static ClickIntersector = ClickIntersector
}
