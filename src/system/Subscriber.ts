import { EventStack } from "@system/EventStack";

export class Subscriber extends EventStack {
  name: string;
  subscriber = true;

  static subscriber = true;

  static _spawn = true;

  constructor(name?: string) {
    super();

    this.name = name || this.constructor.name;
  }
}
