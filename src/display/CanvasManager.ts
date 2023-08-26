import { ApplicationConfiguration } from "thundershock";

import { Kernel } from "@/system/Kernel";
import { Core } from "@system/Core";

export type CanvasManagerContext = HTMLCanvasElement;

export class CanvasManager extends Core {
  context: CanvasManagerContext;

  constructor(kernel: Kernel) {
    super(kernel);

    this.context = this.defineCanvas();
  }

  /**
   * Assigns the existing Canvas to the created CanvasManager or create a new
   * Canvas element that will be assigned to the Application context.
   * @param id
   */
  defineCanvas(id?: string) {
    const initialCanvas: null | HTMLCanvasElement =
      (id && (document.getElementById(id) as HTMLCanvasElement)) ||
      (document.querySelector("canvas") as HTMLCanvasElement);

    // Use the existing canvas element within the created instance.
    if (initialCanvas && initialCanvas instanceof HTMLCanvasElement) {
      return initialCanvas;
    }

    const newCanvas = document.createElement("canvas");

    const newID = id || this.config.display.id;
    if (newID && !document.getElementById(newID)) {
      newCanvas.id = newID;
    }

    const context = document.body;

    context.insertAdjacentElement("afterbegin", newCanvas);

    return newCanvas;
  }
}
