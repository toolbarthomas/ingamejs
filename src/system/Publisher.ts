import { PublisherInstances } from "thundershock";

import { Service } from "@system/Service";
import { Console } from "@system/Console";

/**
 * A Publisher is a simple Interface for storing existing classes that are
 * constructed from the Core Service class constructor.
 */
export class Publisher extends Console {
  instances: PublisherInstances = {};

  constructor() {
    super();
  }

  subscribe(name: string, instance: any) {
    if (!name) {
      Console.error(`Unable to subscribe anonymous instance.`);

      return;
    }

    if (!instance instanceof Service) {
      Console.error(`Unable to subscribe invalid instance: ${instance.name}`);

      return;
    }

    if (this.instances[name]) {
      Console.warning(
        `Unable to overwrite existing instance, you need to remove it first.`
      );

      return;
    }

    this.instances[name] = instance as PublisherInstance;

    Publisher.info(`Instance subscribed: ${name} => ${instance.name}`);
  }

  list(instance: any) {
    if (instance) {
      return Object.values(this.instances).filter((i) => i === instance);
    }

    return Object.values(this.instances);
  }

  publish(name) {}
}
