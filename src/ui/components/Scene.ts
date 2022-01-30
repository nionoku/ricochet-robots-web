// eslint-disable-next-line max-classes-per-file
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
  Camera,
  Raycaster,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import sceneDescription from '@/assets/scene.json';
import cameraDescription from '@/assets/camera.json';
import robotDescription from '@/assets/robot.json';
import { loadObject, loadStl } from '@/utils/loader';
import { Board } from '@/models/Board';
import { Robot } from '@/models/Robot';
import { Game } from '@/models/Game';

const TEMP_SCENE_PATH = 'models/boards/scene_1.json';
const ROBOT_PATH = 'models/robot.stl';

@Options({})
export default class Scene extends Vue {
  @Ref('scene')
  protected container!: HTMLDivElement

  protected whenDestroy: Array<() => unknown> = []

  public async mounted(): Promise<void> {
    const renderer = this.makeRenderer(this.container);
    const scene = this.makeScene();
    const camera = this.makePerspectiveCamera(this.container);
    const controls = this.makeControls(camera, renderer.domElement);
    const raycaster = new Raycaster();

    const [
      sceneObjects,
      robotGeometry,
    ] = await Promise.all([
      loadObject(TEMP_SCENE_PATH),
      loadStl(ROBOT_PATH),
    ]);
    /// --- board ---
    const boardGroupObject = new Board.Builder(sceneObjects.children).make();
    const board = new Board(boardGroupObject);
    /// --- end board ---
    /// --- robots ---
    const initialPositions = board.generateAvailablePositions(robotDescription.robots.length);
    const robots: Array<Robot> = robotDescription.robots
      .map((it, i) => {
        const robotMesh = new Robot.Builder(robotGeometry, new Color(it.color), it.name)
          .make();
        return new Robot(robotMesh, initialPositions[i]);
      });
    board.robots = robots;
    /// --- end robots ---
    /// --- game controller ---
    const gameController = new Game();
    const controlls = new Game.Controlls(robots);
    /// --- end game controller ---
    /// --- add objects on scene ---
    scene.add(board.object);
    scene.add(...robots.map((it) => it.object));
    /// --- end add objects on scene ---
    /// --- listeners ---
    const clickIntersector = new Game.ClickIntersector(raycaster, camera, scene);
    clickIntersector.setIsRobot((name) => name.startsWith(robotDescription.robot_starts_with));
    clickIntersector.setIntersectRobot((uuid) => controlls.onIntersectRobotByClick(uuid));
    clickIntersector.watch();
    this.whenDestroy.push(clickIntersector.cancel);
    /// --- end listeners ---

    // add scene on page
    this.container.appendChild(renderer.domElement);

    function render(time: number) {
      controls.update();
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

  public beforeDestroy(): void {
    this.whenDestroy.forEach((it) => it());
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

  protected makeControls(camera: Camera, canvas: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, canvas);
    controls.enableRotate = true;
    controls.maxZoom = 3;
    // controls.minPolarAngle = 0
    // controls.maxPolarAngle = Math.PI / 3
    // controls.enableDamping = true

    return controls;
  }
}
