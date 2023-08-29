import {
  AnimationThread,
  requestAnimationThread,
} from "@toolbarthomas/animation-thread";

import {
  ApplicationConfiguration,
  TimerOptions,
  TimerSubscribtionOptions,
  TimerSubscribtions,
} from "thundershock";

import { Core } from "@system/Core";
import { Kernel } from "@system/Kernel";

export class Timer extends Core {
  autostart?: boolean;
  fps?: number;
  subscribtions: TimerSubscribtions = {};

  static defaults = {
    autostart: false,
    fps: 60,
  };

  constructor(kernel: Kernel, options?: TimerOptions) {
    super(kernel);

    const { autostart } = options || Timer.defaults;

    this.autostart = autostart;

    this._defineFPS();
  }

  /**
   * Defines the initial FPS value to use within the main and additional
   * loops.
   */
  private _defineFPS() {
    try {
      this.fps = this.kernel.config.display.fps;

      //@todo Dirty fix to ensure the default framerate is more stable;
      if (this.fps >= Timer.defaults.fps) {
        this.fps = Math.round(this.fps * 1.175);

        Core.warning(
          `Main FPS adjusted to ensure a more stable experience: ${this.fps}`
        );
      }
    } catch (exception) {
      if (exception || isNaN(this.fps as any)) {
        this.fps = Timer.defaults.fps;

        if (exception) {
          Core.error(exception);
        }
      }
    }
  }

  /**
   * Subscribes a new handler that will implement a new loop for the running
   * application.
   */
  subscribe(name: string, options?: TimerSubscribtionOptions) {
    if (!this.subscribtions || !name) {
      Core.error("Unable to subscribe undefined timer...");

      return;
    }

    if (Object.keys(this.subscribtions).includes(name)) {
      Core.error(`Unable to overwrite existing timer: ${name}`);

      return;
    }

    const { fps } = options || {};

    this.subscribtions[name] = requestAnimationThread(
      (props) => this.kernel.tick(name, props),
      fps !== undefined ? fps : this.fps || Timer.defaults.fps,
      {
        strict: true,
      }
    );
  }

  /**
   * Starts the actual Timer instance by creating the initial Animation Thread
   * that is assigned as the main loop that the Kernel should use.
   */
  start(name?: string) {
    this.subscribe(name || Kernel.id);

    Core.info(`Timer started: ${name || Kernel.id}@${Timer.now()}`);
  }
}
