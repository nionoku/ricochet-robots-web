// eslint-disable-next-line max-classes-per-file
import { Ref } from 'vue-property-decorator';
import { Options, Vue } from 'vue-class-component';
import {
  NoToneMapping,
  sRGBEncoding,
  WebGLRenderer,
  Scene as ThreeScene,
  Color,
  PerspectiveCamera,
  Raycaster,
  DirectionalLight,
  Vector3,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import sceneDescription from '@/assets/scene.json';
import cameraDescription from '@/assets/camera.json';
import robotDescription from '@/assets/robot.json';
import arrowDescription from '@/assets/arrow.json';
import { loadObject, loadStl } from '@/utils/loader';
import { Board } from '@/models/Board';
import { Robot } from '@/models/Robot';
import { Game } from '@/models/Game';
import { Arrow } from '@/models/Arrow';

const TEMP_SCENE_PATH = 'models/boards/scene_1.json';
const ROBOT_PATH = 'models/robot.stl';
const ARROW_PATH = 'models/arrow.stl';

@Options({})
export default class Scene extends Vue {
  @Ref('scene')
  protected container!: HTMLDivElement

  protected whenDestroy: Array<() => unknown> = []

  public async mounted(): Promise<void> {
    const renderer = this.makeRenderer(this.container);
    const scene = this.makeScene();
    const camera = this.makePerspectiveCamera(this.container);
    const raycaster = new Raycaster();
    const composer = new EffectComposer(renderer);

    const [
      sceneObjects,
      robotGeometry,
      arrowGeometry,
    ] = await Promise.all([
      loadObject(TEMP_SCENE_PATH),
      loadStl(ROBOT_PATH),
      loadStl(ARROW_PATH),
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
    // init iddle animation up and down
    robots.forEach((it) => it.startIddleAnimation(sceneDescription.fps));
    board.robots = robots;
    /// --- end robots ---
    /// --- arrows ---
    const arrows: Array<Arrow> = arrowDescription.arrows.map(({ color, name, direction }) => {
      const arrowMesh = new Arrow.Builder(arrowGeometry, new Color(color), name).make();
      return new Arrow(arrowMesh, direction);
    });
    /// --- end arrows ---
    /// --- lights ---
    const directionalLightsDescription = sceneDescription.directional_lights
      .map(({ intensity, position, color }) => ({
        intensity,
        position: new Vector3(position.x, position.y, position.z),
        color: new Color(color),
      }));
    const directionalLights = this.makeDirectionalLights(directionalLightsDescription);
    /// --- end lights ---
    /// --- game controller ---
    const gameController = new Game();
    const controlls = new Game.Controlls(board, robots, arrows);
    /// --- end game controller ---
    /// --- add objects on scene ---
    scene.add(board.object);
    scene.add(...robots.map((it) => it.object));
    scene.add(...arrows.map((it) => it.object));
    scene.add(...directionalLights);
    /// --- end add objects on scene ---
    /// --- listeners ---
    const clickIntersector = new Game.ClickIntersector(raycaster, camera, scene);
    clickIntersector
      .setOnIntersect((uuid) => controlls.whenIntersectByClick(uuid));
    clickIntersector
      .watch();
    this.whenDestroy.push(clickIntersector.cancel);

    // watch keypress
    window.addEventListener('keydown', (event) => {
      controlls.whenKeypress(event);
    });
    // watch resize window
    window.addEventListener('resize', (event) => {
      event.preventDefault();

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.zoom = this.calcZoom(this.container);
      camera.updateProjectionMatrix();
      renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
    /// --- end listeners ---

    // add scene on page
    this.container.appendChild(renderer.domElement);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    function render(time: number) {
      // render scene
      composer.render();
      // apply robots iddle animation
      robots.forEach((it) => it.processIddleAnimation());
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

  protected makeRenderer(container: HTMLElement): WebGLRenderer {
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
    const aspect = container.clientWidth / container.clientHeight;
    const {
      near, far, fov,
    } = cameraDescription;
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
    // look at center
    camera.lookAt(new Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    return camera;
  }

  protected calcZoom(container: HTMLElement): number {
    const aspect = (container.clientWidth / container.clientHeight) * cameraDescription.zoom;
    return Math.min(aspect, cameraDescription.zoom);
  }

  protected makeDirectionalLights(
    description: Array<Pick<DirectionalLight, 'position' | 'intensity' | 'color'>>,
  ): Array<DirectionalLight> {
    return description.map(({ color, intensity, position }) => {
      const light = new DirectionalLight(new Color(color), intensity);
      light.position.set(position.x, position.y, position.z);

      return light;
    });
  }
}
