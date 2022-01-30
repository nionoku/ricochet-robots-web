import { Ref } from 'vue-property-decorator';
import { Options, Vue } from 'vue-class-component';
import {
  NoToneMapping,
  Renderer,
  sRGBEncoding,
  WebGLRenderer,
  Scene as ThreeScene,
  Color,
  PerspectiveCamera,
} from 'three';
import sceneDescription from '@/assets/scene.json';
import cameraDescription from '@/assets/camera.json';

@Options({})
export default class Scene extends Vue {
  @Ref('scene')
  protected container!: HTMLDivElement

  public async mounted(): Promise<void> {
    const renderer = this.makeRenderer(this.container);
    const scene = this.makeScene();
    const camera = this.makePerspectiveCamera(this.container);

    // add scene on page
    this.container.appendChild(renderer.domElement);

    function render(time: number) {
      // render scene
      renderer.render(scene, camera);
    }

    function animate(): (time: number) => void {
      const timestep = 1000 / sceneDescription.fps;
      let lastTimestamp = 0;

      function tick(time: number) {
        requestAnimationFrame(tick);
        // FPS counter
        if (time - lastTimestamp < timestep) return;

        lastTimestamp = time;
        render(time);
      }

      return tick;
    }

    // start rendering
    animate()(0);
  }

  protected makeRenderer(container: HTMLElement): Renderer {
    const renderer = new WebGLRenderer({
      antialias: true,
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.toneMapping = NoToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);

    return renderer;
  }

  protected makeScene(): ThreeScene {
    const scene = new ThreeScene();
    scene.background = new Color(sceneDescription.background);

    return scene;
  }

  protected makePerspectiveCamera(container: HTMLElement): PerspectiveCamera {
    const fov = this.calcFov(container);
    const aspect = container.clientWidth / container.clientHeight;
    const { near, far } = cameraDescription;
    const zoom = this.calcZoom(container);

    const camera = new PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(
      cameraDescription.position.x,
      cameraDescription.position.y,
      cameraDescription.position.z,
    );
    camera.rotation.set(
      cameraDescription.rotation.x,
      cameraDescription.rotation.y,
      cameraDescription.rotation.z,
    );
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    return camera;
  }

  protected calcFov(container: HTMLElement): number {
    const diag = Math.sqrt((container.clientHeight ** 2) + (container.clientWidth ** 2));
    return 2 * Math.atan(diag / (2 * 1000)) * (180 / Math.PI);
  }

  protected calcZoom(container: HTMLElement): number {
    const diag = Math.sqrt((container.clientHeight ** 2) + (container.clientWidth ** 2));
    const aspect = container.clientWidth / container.clientHeight;
    return diag * (aspect / cameraDescription.zoom.factor);
  }
}
