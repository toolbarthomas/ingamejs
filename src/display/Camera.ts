import { Service } from "@system/Service";
import { Kernel } from "@system/Kernel";

import { CameraProps } from "thundershock";

/**
 * The Camera maintains the relative positions for all created Objects that
 * should be rendered for the Scene the cemera is current listening to
 */
export class Camera extends Service {
  // The height value for the Camera viewport.
  height: number;

  // The width value for the Camera viewport.
  width: number;

  // The horizontal position for the Camera relative to the target element.
  x: number;

  // The vertical position for the Camera relative to the target element.
  y: number;

  // Display the rendered Objects within the given zoom multiplier.
  zoom: number;

  // Lookup any Objects within the existing scene context.
  scene?: string;

  static defaults = {
    name: "main",
    x: 0,
    y: 0,
    zoom: 1,
  };

  constructor(kernel: Kernel, props: CameraProps) {
    super(kernel);

    const { name } = props;

    this.name = name || Camera.defaults.name;

    // Setup the initial Camera position & viewport.
    this.resize();
  }

  /**
   * Defines the renderable area for the constructed Camera.
   *
   * @param props Updates the defined x, y, width and height values when
   * defined.
   */
  resize(props: CameraProps) {
    const { height, width, x, y } = props || {};

    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;

    if (this.height === undefined) {
      this.height = this.kernel.config.display.height;
    }

    if (this.width === undefined) {
      this.width = this.kernel.config.display.width;
    }

    if (this.x === undefined) {
      this.x = Camera.defaults.x;
    }

    if (this.y === undefined) {
      this.y = Camera.defaults.y;
    }
  }
}
