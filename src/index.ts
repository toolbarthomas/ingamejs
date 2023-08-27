import { defineConfiguration } from "@system/config";
import { Kernel } from "@system/Kernel";
import { Timer } from "@system/Timer";

import { RenderEngine } from "@video/RenderEngine";

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

    // Startup the created Kernel with the bootstrapped dependencies.
    kernel.start();

    kernel.attach(
      Kernel.id,
      (props) => {
        console.log("draw", props.fps);
        renderEngine.draw(props);
      },
      { main: true }
    );

    // Start the main loop
    timer.autostart && timer.start();
  },
  { once: true }
);
