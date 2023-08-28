import { PublisherInstances } from "thundershock";

import { Service } from "@system/Service";
import { Console } from "@system/Console";
import { EventStack } from "@system/EventStack";
import { PUBLISHER_GET, PUBLISHER_SET } from "@/event/eventTypes";
import events, { EventBus } from "@/event/Eventbus";

/**
 * A Publisher is a simple Interface for storing existing classes that are
 * constructed from the Core Service class constructor.
 */
export class Publisher extends Console {
  events: EventBus;
  instances: PublisherInstances = {};

  constructor() {
    super();

    this.events = events;

    this.events.on(PUBLISHER_SET, this.set, this);

    this.events.on(PUBLISHER_GET, this.get, this);
  }

  get(instance: EventStack, name: string) {
    if (name && instance && instance.pool instanceof Object) {
      instance.pool[name] = this.publish(name);
    } else {
      Publisher.warning(`Unable to complete get from ${instance.name}`);
    }
  }

  set(instance: EventStack, name: string) {
    console.log("set", instance, instance.pool);

    if (name && instance && instance.pool instanceof Object) {
      this.subscribe(name, instance);
    } else {
      Publisher.warning(`Unable to complete set from ${instance.name}`);
    }
  }

  subscribe(name: string, instance: any) {
    if (!name) {
      Console.error(`Unable to subscribe anonymous instance.`);

      return;
    }

    console.log("subscribe", instance, instance instanceof EventStack);

    if (instance instanceof EventStack === false) {
      Console.error(`Unable to subscribe invalid instance: ${instance.name}`);

      return;
    }

    if (this.instances[name]) {
      Console.warning(
        `Unable to overwrite existing instance, you need to remove it first.`
      );

      return;
    }

    // Ensure duplicate Publisher instances are not included
    this.instances[name] = instance;

    Publisher.info(`Instance subscribed: ${name} => ${instance.name}`);
  }

  list(instance: any) {
    if (instance) {
      return Object.values(this.instances).filter((i) => i === instance);
    }

    return Object.values(this.instances);
  }

  publish(name) {
    console.log("publish", name);
    if (!name || !this.instances[name]) {
      Publisher.warning("Unable to publish undefined instance.");

      return;
    }

    return this.instances[name];
  }
}
