import {
  ApplicationHandler,
  CanvasManagerContext,
  FrameProps,
  RenderEngineOptions,
  TimerSubscribtionOptions,
  TimerSubscriptionHandler,
} from "thundershock";

import { SCENE_CHANGE } from "@event/eventTypes";
import { Core } from "@system/Core";
import { Kernel } from "@system/Kernel";
import { Scene } from "@game/Scene";

export class RenderEngine extends Core {
  currentScene?: Scene;
  target?: RenderEngineOptions["target"];
  display?: CanvasRenderingContext2D;
  pipeline?: CanvasRenderingContext2D;

  constructor(kernel: Kernel, options: RenderEngineOptions) {
    super(kernel);

    const { target } = options || {};
    this.target = target;
    const { display, pipeline } = this.target;

    if (!display) {
      RenderEngine.error(
        `Unable to setup ${this.name} without a view Canvas element.`
      );
      return;
    }

    if (!pipeline) {
      RenderEngine.error(
        `Unable to setup ${this.name} withtout a pipeline Canvas element.`
      );

      return;
    }

    this.display = this.useContext(display) as RenderEngine["display"];
    this.pipeline = this.useContext(pipeline) as RenderEngine["pipeline"];

    if (!target) {
      throw Error(
        `Unable to start ${this.name} without any valid target element.`
      );
    }

    this.kernel.events.on(SCENE_CHANGE, this.setCurrentScene, this);

    RenderEngine.info(`RenderEngine context definitions updated`);
  }

  useContext(
    target: HTMLCanvasElement,
    options?:
      | CanvasRenderingContext2DSettings
      | ImageBitmapRenderingContextSettings
  ) {
    if (!target) {
      RenderEngine.error(`Unable to use context without a valid target`);

      return;
    }

    switch (this.config.display.type) {
      default:
        return target.getContext(
          this.config.display.type,
          options as CanvasRenderingContext2D
        ) as CanvasRenderingContext2D;
    }
  }

  setCurrentScene(scene: Scene) {
    if (scene instanceof Scene) {
      this.currentScene = scene;
      RenderEngine.info(`Current scene updated: ${scene.id}`);
    }
  }

  draw(props: FrameProps) {
    if (!this.kernel || !this.kernel.active) {
      RenderEngine.error(
        `Unable to continue ${this.name} without any active Kernel.`
      );

      return;
    }

    if (!this.pipeline || !this.display) {
      RenderEngine.warning(
        `No pipeline and display context was defined for ${this.name}`
      );

      return;
    }

    this.display.save();

    this.display.strokeRect(0, 0, 300, 300);

    this.display.restore();
  }
}
