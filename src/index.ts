import { defineConfiguration } from "@system/config";
import { Kernel } from "@system/Kernel";
import { Timer } from "@system/Timer";
import { Publisher } from "@system/Publisher";

import { RenderEngine } from "@display/RenderEngine";
import { Camera } from "@display/Camera";
import { Scene } from "@game/Scene";
import events from "@game/Events";

import { CanvasManager } from "@display/CanvasManager";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const config = defineConfiguration({
      name: "bar",
    });

    // Create the Root instance that is shared within the running Application.
    const kernel = new Kernel(config);

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

    // Setup the Service pool that will be used within the constructed
    // application services.
    const pool = new Publisher();
    const services = [camera];
    services.forEach(
      (service) => service.definePool && service.definePool(pool)
    );

    // Proof of concept scene setup:
    const scene1 = new Scene({ id: "scene1", cameras: [Camera.defaults.name] });

    console.log("scene", scene1);

    // @TODO think of method to include loop within the scene
    // scene.on('switch', ...) => should include/exclude loop

    events.on("ready", () => {
      console.log("Emit event now");
    });

    events.emit("ready");

    console.log(pool.list());
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
