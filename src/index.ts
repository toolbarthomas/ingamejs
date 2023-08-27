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

    const f = kernel.attach(Kernel.id, (props, tick, clean, root) => {
      let i = 0;

      const date = new Date().getTime();

      //@CONTINUE expose kernel from window Object?
      console.log("Custom start", root);

      while (i < 10e8) {
        i++;
      }

      console.log(i);

      console.log("Custom end", props.fps, clean, root);

      // throw Error("Foo bar");
    });

    kernel.attach(
      Kernel.id,
      (props, tick, clean, root) => {
        console.log("Other function", clean, props.fps);

        let i = 0;
        while (i < 10e5) {
          i++;
        }

        console.log("delay", i);
      },
      { delay: 1000 }
    );

    // Startup the created Kernel with the bootstrapped dependencies.
    kernel.start();

    // Start the main loop
    timer.autostart && timer.start();
  },
  { once: true }
);
