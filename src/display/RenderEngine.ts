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

    this.context.strokeRect(0, 0, 300, 300);

    this.context.restore();
  }
}
