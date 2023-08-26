import {
  ApplicationConfiguration,
  ApplicationHandler,
  TimerSubscribtionName,
} from "thundershock";

import { Console } from "@system/Console";
import { Core } from "@system/Core";
import { AnimationThreadProps } from "@toolbarthomas/animation-thread/src/_types/main";

export const NAME = "thundershock";

export class Kernel extends Console {
  active?: boolean;
  index: { [key: TimerSubscribtionName]: number } = {};
  config: ApplicationConfiguration;
  queue: ApplicationHandler[] = [];

  // Alias to the initial Kernel namespace value.
  static id = NAME;

  constructor(config: ApplicationConfiguration) {
    super();

    this.config = config;

    Kernel.info("Kernel Loaded");
  }

  /**
   * Attaches the defined handler to the named Kernel queue.
   * @param name Attach the handler to the defined queue thread.
   * @param handler The actual handler to attach.
   * @param options The optional options to use within the handler.
   * @returns
   */
  attach(
    name: ApplicationHandler["name"],
    handler: ApplicationHandler["fn"],
    options?: ApplicationHandler["options"]
  ) {
    const n = name || Kernel.id;

    if (!handler || typeof handler !== "function") {
      Kernel.error(`Unable to attach undefined handler: @${n}`);

      return;
    }

    this.queue.push({ name, fn: handler, options });

    Kernel.info(`Handler attached: @${n}`);
  }

  /**
   * Starts the created Kernel instance and mark it as active.
   *
   * The attached child modules should run from this point since the instance
   * is ready to go.
   *
   * @todo Should implement Event callback.
   */
  start() {
    this.active = true;

    Kernel.info(`Kernel started: ${Date.now()}`);

    return this.active;
  }

  /**
   * Stops the running Kernel and turn off the active flag.
   *
   * @todo Should implement Event callback.
   */
  stop() {
    if (!this.active) {
      Kernel.warning(`The Kernel already has been stopped...`);
    }

    Kernel.info(`Kernel stopped: ${Date.now()}`);

    this.active = false;

    return this.active;
  }

  /**
   * Main handler that should call the required functions within the renderable
   * frame.
   *
   * @param name Calls the handlers from the selected Loop.
   * @param request The current frame properties to use within the called
   * handlers.
   */
  tick(name: string, props: AnimationThreadProps) {
    if (!this.active) {
      Console.error(`Unable to continue tick with inactive Kernel...`);
      return;
    }

    if (!this.index[name]) {
      this.index[name] = 1;
    } else {
      this.index[name] += 1;
    }
    const queue = this.queue.filter((item) => item.name === name);
    // Keep track of the offset when the current Kernel tick is not in sync with
    // the actual frame tick.
    let offset = 0;
    const delta = Math.abs(this.index[name] - props.tick);
    let now: number = 0;

    for (let i = 0; i < queue.length; i += 1) {
      let clean = true;

      if (props.tick > this.index[name]) {
        offset += delta;

        Kernel.warning(
          `Kernel tick mismatch: ${name}[${i}/${queue.length - 1}] ${
            props.timestamp
          } ~ ${delta}ms: ${props.tick} => ${this.index[name]} [${props.fps}/${
            props.targetFPS
          }]`
        );

        // Update the handler index to the current frame tick.
        this.index[name] = props.tick;
      }

      if (!queue[i].duration) {
        Kernel.info(`Benchmark '${name}' handler...`, queue[i].fn);

        now = performance.now();
      }

      const duration = queue[i].duration || 0;
      const tick = queue[i].tick || props.tick;
      const multiplier = Math.round(duration / props.targetFPS);
      const awaitFor = Math.ceil(duration / (1000 / props.targetFPS));

      // Call the initial handler for the first time or wait for the optional
      // awaitFor timeout if the handler duration exceeds the frame budget.
      if (!duration || !awaitFor || tick + awaitFor <= props.tick) {
        if (queue[i].tick !== undefined) {
          queue[i].tick = props.tick;
        }

        clean = awaitFor <= 0;

        if (typeof queue[i].fn === "function") {
          try {
            if (duration && duration >= 1000 / props.targetFPS) {
              const kill = (exception?: any) => {
                exception && Kernel.error(exception);

                if (queue[i].worker) {
                  queue[i].worker?.removeEventListener("error", kill);
                  queue[i].worker?.removeEventListener("messageerror", kill);

                  queue[i].worker?.terminate();

                  delete queue[i].worker;
                }
              };

              if (queue[i].worker instanceof Worker) {
                kill();
              } else {
                setTimeout(kill, duration - 1000 / props.targetFPS);
              }

              // Stringify the current handler and call it within a Web Worker
              // to prevent the main thread from slowing down.
              const template = `
              (${queue[i].fn.toString()}
              )(${JSON.stringify(props)}, ${queue[i].tick}, ${clean})
              `;

              const blob = URL.createObjectURL(
                new Blob([template], {
                  type: "application/javascript",
                })
              );

              // Call the defined handler within a WebWorker.
              // Keep in mind that the actual Kernel is not exposed correctly
              // and the thread can still slow down if the handlers call
              // something from the main thread (like console);
              //
              // You should consider to optimize the converted handler or ensure
              // the logic can run in asynchronous order.
              queue[i].idle !== undefined &&
                cancelIdleCallback(queue[i].idle as any);
              queue[i].idle = requestIdleCallback(() => {
                queue[i].worker = new Worker(blob);

                queue[i].worker?.addEventListener("error", kill);
                queue[i].worker?.addEventListener("messageerror", kill);

                blob && URL.revokeObjectURL(blob);
              });
            } else {
              queue[i].fn(props, queue[i].tick || props.tick, clean);
            }
          } catch (exception) {
            if (exception) {
              Kernel.error(exception);
            }
          }
        }

        // typeof queue[i].fn === "function" &&
        //   queue[i].fn(props, this.index[name], clean);
      }

      const { once } = queue[i].options || {};

      if (once) {
        const index = this.queue
          .map((item, index) => (item.fn === queue[i].fn ? index : undefined))
          .filter((indexOf) => indexOf !== undefined);

        index.forEach((indexOf) => {
          if (this.queue[indexOf as number] !== undefined) {
            delete this.queue[indexOf as number];
          }
        });
      } else if (!queue[i].duration) {
        // Assign the benchmarked result once.
        queue[i].duration = performance.now() - now;

        if (duration >= 1000 / props.targetFPS) {
          const ticks = Math.ceil(duration / (1000 / props.targetFPS));

          Kernel.warning(
            `The '${name}' handler will be called within a WebWorker after each ${ticks} ticks and can return unexpected results, you should consider to optimize the defined handler or just call it once.`,
            "\n",
            queue[i].fn
          );
        }
      }
    }
  }
}
