import {
  ApplicationHandler,
  CanvasManagerContext,
  FrameProps,
  RenderEngineOptions,
  TimerSubscribtionOptions,
  TimerSubscriptionHandler,
} from "thundershock";

import { Core } from "@system/Core";
import { Kernel } from "@/system/Kernel";

let x = 0;
let y = 0;

export class RenderEngine extends Core {
  target: RenderEngineOptions["target"];
  context: CanvasRenderingContext2D;

  constructor(kernel: Kernel, options: RenderEngineOptions) {
    super(kernel);

    const { target } = options || {};
    this.target = target;
    this.context = this.useContext(this.target) as RenderEngine["context"];

    if (!target) {
      throw Error(
        `Unable to start ${this.name} without any valid target element.`
      );
    }
  }

  useContext(target: HTMLCanvasElement) {
    if (!target) {
      RenderEngine.error(`Unable to use context without a valid target`);

      return;
    }

    if (this.context) {
      return this.context;
    }

    switch (this.config.display.type) {
      default:
        return target.getContext(
          this.config.display.type
        ) as CanvasRenderingContext2D;
    }
  }

  draw(props: FrameProps) {
    if (!this.kernel || !this.kernel.active) {
      RenderEngine.error(
        `Unable to continue ${this.name} without any active Kernel.`
      );

      return;
    }

    this.context.save();

    this.context.lineWidth = y / 2;
    if (this.context.lineWidth > 10) {
      this.context.lineWidth = 10;
    }

    const multiplier = Math.floor(props.multiplier * 10) / 10;

    if (x < 400) {
      x += Math.round(1 * multiplier);
      y += Math.round(2 * multiplier);
    } else {
      x = 0;
      y = 0;
    }

    console.log("y", y);

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.target.width, this.target.height);

    // const ease = (Math.ceil(Math.random() * 2) / 10) * (y / 100) + 1;

    this.context.strokeRect(x, y, 100, 20);
    this.context.strokeRect(y, x, 20, 20);
    this.context.strokeRect(y, x, 200, 70);

    this.context.strokeRect(x, y, 300, 300);

    this.context.restore();
  }
}
