// eslint-disable-next-line max-classes-per-file
import { Camera, Raycaster, Scene } from 'three';
import { Robot } from './Robot';

export interface Intersector<E extends Event> {
  // Pick<WindowEventMap, 'click' | 'mouseover'>
  event: keyof WindowEventMap
  listener: (event: E) => any
  onIntersect?: (uuid: string) => void
  watch(): void
  cancel(): void
}

// GlobalEventHandlersEventMap['click'] === MouseEvent
abstract class BaseMouseIntersector implements Intersector<GlobalEventHandlersEventMap['click']> {
  public readonly listener: (event: MouseEvent) => any

  public onIntersect?: (uuid: string) => void

  constructor(
    raycaster: Raycaster,
    camera: Camera,
    scene: Scene,
    public event: keyof Pick<WindowEventMap, 'click'>,
  ) {
    this.listener = (event: GlobalEventHandlersEventMap['click']) => {
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
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected readonly _robots: Array<Robot>,
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
  public static readonly Controlls = Controlls

  public static readonly ClickIntersector = ClickIntersector
}
