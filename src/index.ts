import { defineConfiguration } from "@system/config";
import { Kernel } from "@system/Kernel";
import { Timer } from "@system/Timer";

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

    kernel.attach(Kernel.id, (props, tick, clean) => {
      let i = 0;

      const date = new Date().getTime();

      while (i < 10e7) {
        i++;
      }

      setTimeout(() => {
        console.log("Cannot see me", props.tick, tick);
      }, 2000);

      console.log("My custom function", props.tick, tick, props.fps);

      // throw Error("Foo bar");
    });

    kernel.attach(Kernel.id, (props, tick, clean) => {
      console.log("Other function", props.tick, tick, props.fps);
    });

    // Startup the created Kernel with the bootstrapped dependencies.
    kernel.start();

    // Start the main loop
    timer.autostart && timer.start();
  },
  { once: true }
);
