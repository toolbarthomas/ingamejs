import {
  ApplicationConfiguration,
  InstanceConfiguration,
  SceneProps,
} from "thundershock";

import { KERNEL_START, SERVICE_PRELOAD } from "@event/eventTypes";
import events from "@event/Eventbus";

import { Camera } from "@display/Camera";
import { CanvasManager } from "@display/CanvasManager";
import { RenderEngine } from "@display/RenderEngine";

import { defineConfiguration } from "@system/config";
import { EventStack } from "./system/EventStack";
import { Kernel } from "@system/Kernel";
import { Service } from "@system/Service";
import { Timer } from "@system/Timer";

import { GameObject } from "@game/GameObject";
import { Publisher } from "@system/Publisher";
import { Scene } from "@game/Scene";
import { Subscriber } from "./system/Subscriber";

/**
 * The entry Class for creating a new Thundershock game.
 */
class Thundershock {
  config: ApplicationConfiguration;
  defaults = {
    Camera: Camera.defaults,
    Scene: Scene.defaults,
    Timer: Timer.defaults,
  };
  kernel: Kernel;
  pool: Publisher;
  timer: Timer;

  constructor(config?: InstanceConfiguration) {
    // Define the actual configuration that can be customized.
    this.config = defineConfiguration(config);

    // Create the Root instance that is shared within the running Application.
    const kernel = new Kernel(this.config);
    this.kernel = kernel;

    // Defines the main game loop function handler that will render the actual
    // game.
    this.timer = new Timer(kernel, { autostart: true });

    // Setup the Service pool that will be used within the constructed
    // application services.
    this.pool = new Publisher();

    // Await for the DOM to finish before we proceed loading the required
    // libraries.
    this.kernel.ready(() => this.init());
  }

  /**
   * Adds a new Object within the Thundershock instance
   */
  add(type: string, payload: any) {
    if (`${type}` in globalThis === false) {
      Kernel.error(
        `Unable to create new game Object from undefined class constructor: ${type}`
      );
    }

    Kernel.info(`Object created: ${type}`, payload);

    //@ts-ignore
    return new globalThis[type](payload);
  }

  /**
   * Adds a new Scene Object and include it within the existing pool.
   *
   * @param props Create a new scene with the defined Scene properties.
   */
  addScene(props: SceneProps) {
    const { cameras, ...rest } = props;

    const scene = this.add("Scene", {
      ...rest,
      cameras: cameras || [this.defaults.Camera.name],
    }) as Scene;

    this.pool.subscribe(scene.id, scene);

    return scene;
  }

  /**
   * Callback handler that will define the required libraries that will
   * interact with the created game Objects.
   */
  init() {
    // Defines at least one Camera, more can be created during development or
    // runtime. A Camera will assign itself to the Pool automatically and can
    // be defined directly within the context. This ensure that the Pool only
    // contains unique Camera instances.
    new Camera(this.kernel, {
      x: 0,
      y: 0,
      width: this.kernel.config.display.width,
      height: this.kernel.config.display.height,
    });

    new Camera(this.kernel, { name: "Camera2" });

    // const camera2 = new Camera(this.kernel, {
    //   x: 0,
    //   y: 0,
    //   width: this.kernel.config.display.width,
    //   height: this.kernel.config.display.height,
    // });

    // Use the Canvas Manager to manage the existing canvas element.
    const canvasManager = new CanvasManager(this.kernel);

    // Root entry for rendering the Timer related callback results.
    const renderEngine = new RenderEngine(this.kernel, {
      target: canvasManager.useContext(),
    });

    // Assign the default libraries to the Service pool.
    this.pool.subscribe("CanvasManager", canvasManager);
    this.pool.subscribe("RenderEngine", renderEngine);

    this.pool.subscribe("GameObject", GameObject);

    // Set the initial width and height for the display.
    canvasManager.resizeContext(
      this.kernel.config.display.width,
      this.kernel.config.display.height
    );

    console.log("POOL", this.pool);

    // Signal the libraries that the Kernel has started.
    this.kernel.start();
  }
}

/**
 * Construct the ThunderShock framework.
 */
const application = new Thundershock();

/**
 * Implements the actual Game.
 */
application.kernel.events.on(KERNEL_START, () => {
  const scene = application.addScene({
    id: "scene1",
    preload(callback, context) {
      setTimeout(() => {
        console.log("foobar");

        callback(200);
      }, 3000);
    },
    init() {
      console.log("Scene init");
    },
    create(scene: Scene) {
      const go = scene.add("GameObject", {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      });

      // const go2 = scene.add("GameObject", {
      //   x: 0,
      //   y: 0,
      //   width: 100,
      //   height: 50,
      // });

      // const go3 = scene.add("GameObject", {
      //   x: 0,
      //   y: 0,
      //   width: 50,
      //   height: 25,
      // });

      // const go4 = scene.add("Sprite", {
      //   x: 0,
      //   y: 0,
      //   width: 50,
      //   height: 25,
      // });

      console.log("Create some magic", go, scene);
    },
    start() {
      console.log("scene start");
    },
  });

  // scene.start();
  scene.create();
  scene.destroy();
  console.log("SCENE", scene);

  // scene.start();
});
