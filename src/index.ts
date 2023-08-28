import { defineConfiguration } from "@system/config";
import { Kernel } from "@system/Kernel";
import { Timer } from "@system/Timer";
import { Publisher } from "@system/Publisher";

import { RenderEngine } from "@display/RenderEngine";
import { Camera, Camera } from "@display/Camera";
import { Scene } from "@game/Scene";
import events from "@event/Eventbus";
import { SERVICE_PRELOAD } from "./event/eventTypes";

import { CanvasManager } from "@display/CanvasManager";
import { Service } from "@system/Service";
import { EventStack } from "./system/EventStack";
import { ApplicationConfiguration, InstanceConfiguration } from "thundershock";

class Thundershock {
  config: ApplicationConfiguration;
  kernel: Kernel;
  timer: Timer;

  constructor(config?: InstanceConfiguration) {
    this.config = defineConfiguration(config);

    // Create the Root instance that is shared within the running Application.
    const kernel = new Kernel(this.config);
    this.kernel = kernel;

    this.timer = new Timer(kernel, { autostart: true });

    // Setup the Service pool that will be used within the constructed
    // application services.
    const pool = new Publisher();

    const camera = new Camera(kernel, {
      x: 0,
      y: 0,
      width: kernel.config.display.width,
      height: kernel.config.display.height,
    });
    const canvasManager = new CanvasManager(kernel);

    const renderEngine = new RenderEngine(kernel, {
      target: canvasManager.useContext(),
    });

    pool.subscribe("Camera", camera);
    pool.subscribe("CanvasManager", canvasManager);
    pool.subscribe("RenderEngine", renderEngine);

    // Set the initial width and height for the display.
    canvasManager.resizeContext(
      kernel.config.display.width,
      kernel.config.display.height
    );

    this.kernel.start();

    this.timer.autostart && this.timer.start();
  }
}

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const application = new Thundershock({
      name: "bar",
    });

    // Proof of concept scene setup:
    const scene1 = new Scene({ id: "scene1", cameras: [Camera.defaults.name] });
    const scene2 = new Scene({ id: "scene2", cameras: [Camera.defaults.name] });

    scene1.get("Camera");

    console.log("result", scene1.pool.Camera);

    scene1.switch();

    console.log("result", scene1.pool);

    scene2.switch(scene1);
    scene2.start();

    const myCamera = scene1.getCamera();

    console.log("Camera", myCamera);

    console.log("scene1", scene1);
  },
  { once: true }
);
