import { defineConfiguration } from "@system/config";
import { Kernel } from "@system/Kernel";
import { Timer } from "@system/Timer";
import { Publisher } from "@system/Publisher";

import { RenderEngine } from "@display/RenderEngine";
import { Camera } from "@display/Camera";
import { Scene } from "@game/Scene";
import events from "@event/Eventbus";
import { SERVICE_PRELOAD } from "./event/eventTypes";

import { CanvasManager } from "@display/CanvasManager";
import { Service } from "@system/Service";
import { EventStack } from "./system/EventStack";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const config = defineConfiguration({
      name: "bar",
    });

    // Create the Root instance that is shared within the running Application.
    const kernel = new Kernel(config);

    // Setup the Service pool that will be used within the constructed
    // application services.
    const pool = new Publisher();

    // // Attach the constructed Service pool for all services
    // kernel.events.on(PUBLISHER_REQUEST, (instance?: EventStack) => {
    //   instance && instance.definePool && instance.definePool(pool);
    // });

    const timer = new Timer(kernel, { autostart: true });

    const canvasManager = new CanvasManager(kernel);
    canvasManager.resizeContext(
      kernel.config.display.width,
      kernel.config.display.height
    );

    const renderEngine = new RenderEngine(kernel, {
      target: canvasManager.useContext(),
    });

    // Setup the default Camera.
    const camera = new Camera(kernel, {
      x: 0,
      y: 0,
      width: canvasManager.useContext().width || kernel.config.display.width,
      height: canvasManager.useContext().height || kernel.config.display.height,
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

    // Startup the created Kernel with the bootstrapped dependencies.
    kernel.start();

    // kernel.attach(
    //   Kernel.id,
    //   (props) => {
    //     console.log("draw", props.fps);
    //     renderEngine.draw(props);
    //   },
    //   { main: true }
    // );

    // Start the main loop
    timer.autostart && timer.start();
  },
  { once: true }
);
