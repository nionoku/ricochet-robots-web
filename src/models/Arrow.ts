// eslint-disable-next-line max-classes-per-file
import { Direction } from '@/types/direction';
import {
  BufferGeometry, Color, Mesh, MeshStandardMaterial, Object3D, Vec2,
} from 'three';
import arrowDescription from '@/assets/arrow.json';
import { Robot } from './Robot';

class Builder {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected readonly _geometry: BufferGeometry,
    protected readonly _color: Color,
    protected readonly _name: string,
  ) {}

  public make(): Mesh {
    const material = new MeshStandardMaterial({
      color: this._color,
      transparent: Boolean(arrowDescription.opacity),
      opacity: arrowDescription.opacity,
    });
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
    arrowObject.scale.set(
      arrowDescription.height,
      arrowDescription.width,
      0.02,
    );
    const rotateByZ = _direction % 2
      ? (Math.PI / 2) * _direction + Math.PI
      : (Math.PI / 2) * _direction;

    arrowObject.rotation.set(-(Math.PI / 2), 0, rotateByZ);
    arrowObject.position.setY(0.1);
    // eslint-disable-next-line no-param-reassign
    arrowObject.visible = false;
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

  public get visible(): boolean {
    return this.arrowObject.visible;
  }

  public set visible(visible: boolean) {
    this.arrowObject.visible = visible;
  }
}

export function calcArrowsPositions(
  robot: Robot,
): Array<{ direction: Direction, position: Vec2 }> {
  return Array.from({ length: 4 })
    .map((_, i) => ({
      direction: i,
      position: {
        x: robot.position.x + (((i - 1) % 2) * (1 + arrowDescription.height * 20)),
        y: robot.position.y + (((i - 2) % 2) * (1 + arrowDescription.height * 20)),
      },
    }));
}
