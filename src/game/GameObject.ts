import { Subscriber } from "@system/Subscriber";

import events from "@event/EventBus";
import { GameObjectProps } from "thundershock";

export const useGameObjectProps = (props: any) => {
  const { height, width, x, y }: GameObjectProps = props || {};

  return { height, width, x, y } as GameObjectProps;
};

export class GameObject extends Subscriber {
  // The height the Object will render in.
  height: number;

  // The width the Object will render in.
  width: number;

  // The horizontal x position of the Object.
  x: number;

  // The vertical y position of the Object.
  y: number;

  // Prevents the injection within the current scene when TRUE.
  invalid?: boolean;

  constructor(name: string, props: any) {
    super(name);

    const { height, width, x, y } = useGameObjectProps(props);
    this.height = height;
    this.width = width;
    this.x = x || 0;
    this.y = y || 0;

    if (this.width === undefined || this.height === undefined) {
      GameObject.warning(`Unable to set width/height for ${this.name}`);
      return;
    }

    // Ensure the actual Object name is used instead of the unique name.
    const [n] = name.split("__");

    GameObject.info(`${n} created: ${this.name}`);
  }

  /**
   * Defines the preload reference but a GameObject should implement it's own
   * variant without calling super.preload() to ensure the correct behaviour is
   * expected.
   */
  preload() {
    return new Promise<number>((resolve) => resolve(200));
  }
}
