import { Object3D, Vec2 } from 'three';

export class Robot {
// eslint-disable-next-line no-useless-constructor
  constructor(
  private _robot: Object3D,
  ) {}

  public get uuid(): string {
    return this._robot.uuid;
  }

  public set position({ x, y }: Vec2) {
    this._robot.position.set(x, this._robot.position.y, y);
  }

  public get position(): Vec2 {
    return this._robot.position;
  }
}
