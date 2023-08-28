import {
  ApplicationConfiguration,
  ApplicationHandler,
  FrameProps,
  TimerSubscribtionName,
} from "thundershock";

import events, { EventBus } from "@event/Eventbus";
import { KERNEL_START } from "@event/eventTypes";
import { Console } from "@system/Console";
import { Core } from "@system/Core";

export const NAME = "thundershock";

export class Kernel extends Console {
  active?: boolean;
  events: EventBus = events;
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
   * Attaches the defined handler to the named Kernel queue. The actual handler
   * should run for each tick within the defined requestAnimationFrame context.
   * The attached function will be called from the Kernel.tick method if the
   * name value matches within mentioned handler parameter:
   *
   * Kernel.tick('foo') // Will only call function that are assigned as Kernel.attach('foo', ...)
   *
   * You can delay the first usage of the attached handler by using the delay
   * property option. The Kernel will try to run the defined timeout within the
   * closest frame. This should minimize the offset between the assignment of
   * the handler since it stalls the actual handler to the expected tick instead
   * of using an actual setTimeout.
   *
   * An attached handler that exceeds the frame budget will be throttled by
   * moving it as an Web Worker to reduce the load on the main thread.
   * This can be usefull if large calculations are required within a single
   * function but keep in mind that any application related context is lost
   * within the Web Worker. You should avoid this method and try to optimize
   * your logic.
   *
   * @param name Attach the handler to the defined queue thread.
   * @param handler The actual handler to attach.
   * @param options The optional options to use within the handler.
   */
  attach(
    name: ApplicationHandler["name"],
    fn: ApplicationHandler["fn"],
    options?: ApplicationHandler["options"]
  ) {
    const n = name || Kernel.id;

    if (!fn || typeof fn !== "function") {
      Kernel.error(`Unable to attach undefined handler: @${n}`);

      return;
    }

    const handler = {
      name,
      fn,
      options: options || {},
      timestamp: Kernel.now(),
    };

    this.queue.push(handler);

    Kernel.info(`Handler attached: ${n}@${handler.timestamp}`);

    return handler;
  }

  /**
   * Detach the existing handler from the Kernel queue by it's timestamp or the
   * handler function and estimated duration.
   *
   * @param context Removes the handler from it's timestamp or all handlers
   * with identical functions.
   * @param error Should be true if the detach was because of an exception.
   */
  detach(context: number | ApplicationHandler, error?: boolean) {
    let status = false;

    if (!this.queue || !this.queue.length) {
      Kernel.log(`Unable to detach without any queue...`);

      return status;
    }

    if (typeof context !== "number") {
      if (context.duration === undefined || typeof context.fn !== "function") {
        Kernel.error(`Unable to detach invalid handler: ${context.name}`);

        return status;
      }
    }

    for (let i = 0; i < this.queue.length; i++) {
      let remove = false;
      if (typeof context === "number" && context === this.queue[i].timestamp) {
        remove = true;
      } else if (
        typeof context !== "number" &&
        this.queue[i].duration === context.duration &&
        this.queue[i].fn === context.fn &&
        !(context.options || {}).once
      ) {
        remove = true;
      }

      if (remove) {
        if (error) {
          Kernel.warning(
            `The attached handler ${
              this.queue[i].timestamp
            } has been removed at: ${Kernel.now()}`
          );
        }

        delete this.queue[i];

        status = true;

        break;
      }
    }

    if (status) {
      Console.info(
        `Handler detached: ${
          typeof context === "number" ? context : context.timestamp
        }`
      );
    }

    return status;
  }

  ready(handler: Function) {
    window.addEventListener("DOMContentLoaded", handler, { once: true });
  }

  /**
   * Kills the running Web Worker from the given ApplicationHandler and detach
   * it afterwards.
   *
   * @param handler Terminate the Worker from the given handler.
   * @param exception Should be TRUE if the kill method was used because of an
   */
  kill(handler: ApplicationHandler | null, exception?: any) {
    if (handler && handler.worker) {
      handler.worker.terminate();

      delete handler.worker;

      if (exception) {
        Kernel.error(
          "eee",
          handler.duration,
          (1000 / this.config.display.fps) * 2
        );
        Kernel.error(exception);

        this.detach(handler, true);
        handler = null;
      }
    } else if (handler) {
      Kernel.warning(
        `Unable to kill undefined Worker: ${handler.name}@${handler.timestamp}`
      );
    }
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

    this.events.emit(KERNEL_START, this);

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
  tick(name: string, props: FrameProps) {
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

        now = Kernel.now();
      }

      const delay = queue[i].options.delay;
      const duration = queue[i].duration || 0;
      const tick = queue[i].tick || 0;
      const multiplier = Math.round(duration / props.targetFPS);
      const awaitFor = Math.floor(duration / (1000 / props.targetFPS));
      const delayDelta = Kernel.now() - queue[i].timestamp;

      // Call the initial handler for the first time or wait for the optional
      // awaitFor timeout if the handler duration exceeds the frame budget.
      if (!duration || !awaitFor || tick + awaitFor <= props.tick) {
        if (delay && delay - delayDelta > 0) {
          continue;
        }

        if (tick !== undefined) {
          queue[i].tick = props.tick;
        }

        clean = awaitFor <= 0;

        if (typeof queue[i].fn === "function") {
          try {
            // Convert the given handler if it at least skips 1 frame.
            const min = (1000 / props.targetFPS) * 2;

            if (queue[i].options && queue[i].options.main) {
              queue[i].fn(props, queue[i].tick || props.tick, clean, this);
            } else if (duration && duration >= min) {
              if (queue[i].worker instanceof Worker) {
                this.kill(queue[i]);
              } else {
                queue[i].timeout && clearTimeout(queue[i].timeout);
                // Timeout the constructed Web Worker and terminate afterwards.
                queue[i].timeout = setTimeout(
                  () => {
                    console.log("timeout in", queue[i].fn, [...this.queue]);
                    this.kill(queue[i]);
                    console.log(
                      "timeout out",
                      duration,
                      duration - 1000 / props.targetFPS
                    );
                  },
                  duration - 1000 / props.targetFPS,
                  this.queue
                );
              }

              // Stringify the current handler and call it within a Web Worker
              // to prevent the main thread from slowing down.
              const fn = queue[i].fn.toString();
              const json = JSON.stringify(props);
              const template = `(${fn})(${json}, ${tick}, ${clean})`;

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
              // queue[i].idle !== undefined &&
              //   cancelIdleCallback(queue[i].idle as any);
              // queue[i].idle = requestIdleCallback(() => {
              queue[i].worker = new Worker(blob);

              queue[i].worker?.addEventListener(
                "error",
                (error) => this.kill(queue[i], error),
                {
                  once: true,
                }
              );

              queue[i].worker?.addEventListener(
                "messageerror",
                (error) => this.kill(queue[i], error),
                {
                  once: true,
                }
              );

              blob && URL.revokeObjectURL(blob);
              // });
            } else {
              // Default behaviour
              queue[i].fn(props, queue[i].tick || props.tick, clean, this);
            }
          } catch (exception) {
            if (exception) {
              Kernel.error(exception);
            }
          }
        }
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
        queue[i].duration = Kernel.now() - now;

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
