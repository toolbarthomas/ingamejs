import { ApplicationConfiguration, CanvasManagerContext } from "thundershock";

import { KERNEL_UPDATE } from "@event/eventTypes";

import { Kernel } from "@system/Kernel";
import { Core } from "@system/Core";
import { Scene } from "@game/Scene";

export class CanvasManager extends Core {
  context?: CanvasManagerContext;

  constructor(kernel: Kernel) {
    super(kernel);
  }

  /**
   * Assigns the existing Canvas to the created CanvasManager or create a new
   * Canvas element that will be assigned to the Application context.
   *
   * @param id Use the optional ID value for the element target.
   */
  defineCanvas(id?: string) {
    const initialCanvas: null | HTMLCanvasElement =
      (id && (document.getElementById(id) as HTMLCanvasElement)) ||
      (document.querySelector("canvas") as HTMLCanvasElement);

    // Setup the canvas pipeline that will contain all renderable objects for
    // the scene.
    const pipeline = document.createElement("canvas");
    pipeline.id = `${id}-pipeline`;

    const result: any = {};

    // Use the existing canvas element within the created instance.
    if (initialCanvas && initialCanvas instanceof HTMLCanvasElement) {
      return { display: initialCanvas, pipeline };
    }

    const newCanvas = document.createElement("canvas");

    const newID = id || this.config.display.id;
    if (newID && !document.getElementById(newID)) {
      newCanvas.id = newID;
      pipeline.id = `${newID}-pipeline`;

      result.pipeline = pipeline;
      result.display = newCanvas;
    }

    // Ensure the canvas pipeline is unique.
    const initialPipeline = pipeline.id && document.getElementById(pipeline.id);
    if (initialPipeline) {
      initialPipeline.remove && initialPipeline.remove();
    }

    document.body.insertAdjacentElement("afterbegin", result.pipeline);
    document.body.insertAdjacentElement("afterbegin", result.display);

    this.context = result;

    return result as CanvasManagerContext;
  }

  resizeContext(width: number, height: number) {
    const { display } = this.context || this.defineCanvas();

    if (display) {
      display.width = width;
      display.height = height;
    }
  }

  /**
   * Returns the defined CanvasContext or define a new Canvas.
   *
   * @param id Optional id property to use.
   */
  useContext(id?: string) {
    return this.context || this.defineCanvas(id);
  }
}
