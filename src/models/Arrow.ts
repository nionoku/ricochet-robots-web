// eslint-disable-next-line max-classes-per-file
import { Direction } from '@/types/direction';
import {
  BufferGeometry, Color, Mesh, MeshStandardMaterial, Object3D, Vec2,
} from 'three';

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

export class Arrow {
  public static readonly Builder = Builder

  constructor(
    protected readonly arrowObject: Object3D,
    protected readonly _direction: Direction,
  ) {
    arrowObject.scale.set(0.01, 0.008, 0.02);
    arrowObject.rotation.set(-(Math.PI / 2), 0, (Math.PI / 2) * _direction);
    arrowObject.position.setY(0.1);
    // eslint-disable-next-line no-param-reassign
    // arrowObject.visible = false;
  }

  public get uuid(): string {
    return this.arrowObject.uuid;
  }

  public get object(): Object3D {
    return this.arrowObject;
  }

  public set position({ x, y }: Vec2) {
    this.arrowObject.position.set(x, this.arrowObject.position.y, y);
  }

  public get position(): Vec2 {
    return {
      x: this.arrowObject.position.x,
      y: this.arrowObject.position.z,
    };
  }

  public get direction(): Direction {
    return this._direction;
  }
}
