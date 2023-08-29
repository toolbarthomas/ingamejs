import { Service } from "@system/Service";
import { Kernel } from "@system/Kernel";

import { CameraProps } from "thundershock";
import { SCENE_CHANGE } from "@event/eventTypes";
import { Scene } from "@game/Scene";

/**
 * The Camera maintains the relative positions for all created Objects that
 * should be rendered for the Scene the cemera is current listening to
 */
export class Camera extends Service {
  // The height value for the Camera viewport.
  height: number = Camera.defaults.height;

  // The width value for the Camera viewport.
  width: number = Camera.defaults.width;

  // The horizontal position for the Camera relative to the target element.
  x: number = Camera.defaults.x;

  // The vertical position for the Camera relative to the target element.
  y: number = Camera.defaults.y;

  // Display the rendered Objects within the given zoom multiplier.
  zoom: number = Camera.defaults.zoom;

  // Lookup any Objects within the existing scene context.
  scene?: Scene;

  static defaults = {
    height: 0,
    name: "Camera",
    x: 0,
    y: 0,
    width: 0,
    zoom: 1,
  };

  constructor(kernel: Kernel, props: CameraProps) {
    super(kernel);

    const { name } = props || {};

    this.name = props.name || Camera.defaults.name;

    this.set(this.name);

    // Setup the initial Camera position & viewport.
    this.resize();

    // Assign the current Scene to the camera during a Scene Change event.
    this.kernel.events.on(SCENE_CHANGE, this.setCurrentScene, this);
  }

  /**
   * Defines the renderable area for the constructed Camera.
   *
   * @param props Updates the defined x, y, width and height values when
   * defined.
   */
  resize(props?: CameraProps) {
    const { height, width, x, y } = props || {};

    this.height =
      height !== undefined ? height : this.kernel.config.display.height;
    this.width = width !== undefined ? width : this.kernel.config.display.width;
    this.x = x !== undefined ? x : Camera.defaults.x;
    this.y = y !== undefined ? y : Camera.defaults.y;
  }

  /**
   * Assigns the current scene to the Camera instance if the Scene.cameras
   * contains the defined Camera name.
   *
   * You should not need to call this method since it is called during a
   * SCENE_CHANGE event.
   *
   * @param scene Assign the scene to the defined Camera.
   */
  setCurrentScene(scene: Scene) {
    if (scene instanceof Scene && scene.cameras && scene.cameras.length) {
      if (scene.cameras.includes(this.name)) {
        Camera.info(`Camera selected for Scene: ${scene.id}`);

        this.scene = scene;
      }
    }
  }
}
