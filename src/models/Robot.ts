// eslint-disable-next-line max-classes-per-file
import {
  Object3D, Vec2, BufferGeometry, Color, Mesh, MeshStandardMaterial,
} from 'three';
import robotDescription from '@/assets/robot.json';

class Builder {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected readonly _geometry: BufferGeometry,
    protected readonly _color: Color,
    protected readonly _name: string,
  ) {}

  public make(): Mesh {
    const material = new MeshStandardMaterial({ color: this._color });
    const mesh = new Mesh(this._geometry, material);
    mesh.name = this._name;
    return mesh;
  }
}

export class Robot {
  public static readonly Builder = Builder

  protected iddleAnimationDirection: -1 | 1 = 1

  protected _hasIddleAnimation = true

  protected fps = 0

  constructor(
    protected readonly robotObject: Object3D,
    initialPosition: Vec2,
  ) {
    robotObject.scale.set(0.03, 0.03, 0.03);
    robotObject.rotation.set(-(Math.PI / 2), 0, 0);

    this.position = initialPosition;
  }

  public get uuid(): string {
    return this.robotObject.uuid;
  }

  public set position({ x, y }: Vec2) {
    this.robotObject.position.set(x, this.robotObject.position.y, y);
  }

  public get position(): Vec2 {
    return this.robotObject.position;
  }

  public get object(): Object3D {
    return this.robotObject;
  }

  public set positionByZ(position: number) {
    this.robotObject.position.setY(position);
  }

  public get positionByZ(): number {
    return this.robotObject.position.y;
  }

  public startIddleAnimation(fps = this.fps): void {
    if (fps !== this.fps) {
      this.fps = fps;
    }

    const [minPosition, maxPosition] = [
      robotDescription.by_z_animation_limits[0],
      robotDescription.by_z_animation_limits[1],
    ];
    const initPosition = Math.random() * (maxPosition - minPosition) + minPosition;

    this.positionByZ = initPosition;
  }

  public keepIddleAnimation(): void {
    this._hasIddleAnimation = true;
  }

  public cancelIddleAnimation(): void {
    this._hasIddleAnimation = false;

    const [initialPosition] = [
      robotDescription.by_z_animation_limits[0],
    ];

    this.positionByZ = initialPosition;
  }

  public processIddleAnimation(): void {
    if (this._hasIddleAnimation && this.fps > 0) {
      const [step, minPosition, maxPosition] = [
        robotDescription.by_z_animation_step,
        robotDescription.by_z_animation_limits[0],
        robotDescription.by_z_animation_limits[1],
      ];

      const stepDelta = step * this.iddleAnimationDirection * this.fpsAspect;
      const nextPosition = this.robotObject.position.y + stepDelta;

      if (nextPosition <= minPosition) {
        this.iddleAnimationDirection = 1;
      }

      if (nextPosition >= maxPosition) {
        this.iddleAnimationDirection = -1;
      }

      this.positionByZ = nextPosition;
    }
  }

  public get hasIddleAnimation(): boolean {
    return this._hasIddleAnimation;
  }

  protected get fpsAspect(): number {
    return (1 - this.fps / 100);
  }
}
