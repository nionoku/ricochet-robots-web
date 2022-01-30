// eslint-disable-next-line max-classes-per-file
import {
  Object3D, Vec2, BufferGeometry, Color, Mesh, MeshStandardMaterial,
} from 'three';

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

  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected _robot: Object3D,
    _initialPosition?: Vec2,
  ) {
    _robot.scale.set(0.03, 0.03, 0.03);
    _robot.rotation.set(-(Math.PI / 2), 0, 0);

    if (_initialPosition) {
      this.position = _initialPosition;
    }
  }

  public get uuid(): string {
    return this._robot.uuid;
  }

  public set position({ x, y }: Vec2) {
    this._robot.position.set(x, this._robot.position.y, y);
  }

  public get position(): Vec2 {
    return this._robot.position;
  }

  public get object(): Object3D {
    return this._robot;
  }

  public set positionByZ(position: number) {
    this._robot.position.setY(position);
  }

  public get positionByZ(): number {
    return this._robot.position.y;
  }
}
