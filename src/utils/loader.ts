import { BufferGeometry, Object3D, ObjectLoader } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

export function loadObject(path: string): Promise<Object3D> {
  const loader = new ObjectLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (object) => resolve(object),
      undefined,
      (err) => reject(err),
    );
  });
}

export function loadStl(path: string): Promise<BufferGeometry> {
  const loader = new STLLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (object) => resolve(object),
      undefined,
      (err) => reject(err),
    );
  });
}
