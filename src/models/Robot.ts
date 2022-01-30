// eslint-disable-next-line max-classes-per-file
import {
  Object3D, Vec2, BufferGeometry, Color, Mesh, MeshStandardMaterial,
} from 'three';
import robotDescription from '@/assets/robot.json';

class Builder {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected _geometry: BufferGeometry,
    protected _color: Color,
    protected _name: string,
  ) {}

  public make(): Mesh {
    const material = new MeshStandardMaterial({ color: this._color });
    const mesh = new Mesh(this._geometry, material);
    mesh.name = this._name;
    return mesh;
  }
}

export class Robot {
  public static Builder = Builder

  protected iddleAnimationDirection: -1 | 1 = 1

  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected robotObject: Object3D,
    _initialPosition: Vec2,
    protected hasIddleAnimation = true,
  ) {
    robotObject.scale.set(0.03, 0.03, 0.03);
    robotObject.rotation.set(-(Math.PI / 2), 0, 0);

    this.position = _initialPosition;
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

  public startIddleAnimation(): void {
    const [min, max] = [
      robotDescription.by_z_animation_limits[0],
      robotDescription.by_z_animation_limits[1],
    ];
    const initPosition = Math.random() * (max - min) + min;

    this.robotObject.position.setY(initPosition);
  }

  public cancelIddleAnimation(): void {
    this.hasIddleAnimation = false;

    const [initialPosition] = [
      robotDescription.by_z_animation_limits[0],
    ];

    this.robotObject.position.setY(initialPosition);
  }

  public processIddleAnimation(): void {
    if (this.hasIddleAnimation) {
      const [step, min, max] = [
        robotDescription.by_z_animation_step,
        robotDescription.by_z_animation_limits[0],
        robotDescription.by_z_animation_limits[1],
      ];

      // TODO (2022.01.31): Calculate step by FPS
      const nextPosition = this.robotObject.position.y + (step * this.iddleAnimationDirection);

      if (nextPosition <= min) {
        this.iddleAnimationDirection = 1;
      }

      if (nextPosition >= max) {
        this.iddleAnimationDirection = -1;
      }

      this.robotObject.position.setY(nextPosition);
    }
  }
}
