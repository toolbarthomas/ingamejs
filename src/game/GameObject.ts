import { Subscriber } from "@system/Subscriber";

import events from "@event/Eventbus";
import { GameObjectProps } from "thundershock";

export class GameObject extends Subscriber {
  height: number;
  width: number;
  x: number;
  y: number;

  constructor(name: string, props: GameObjectProps) {
    super(name);

    const { height, width, x, y } = props || {};
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
}
