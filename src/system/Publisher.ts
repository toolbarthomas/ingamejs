import { PublisherInstance, PublisherInstances } from "thundershock";

import { Service } from "@system/Service";
import { Console } from "@system/Console";
import { Subscriber } from "@system/Subscriber";
import {
  PUBLISHER_DELETE,
  PUBLISHER_GET,
  PUBLISHER_SET,
} from "@event/eventTypes";
import events, { EventBus } from "@event/EventBus";

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

    this.events.on(PUBLISHER_DELETE, this.delete, this);
  }

  delete(instance: PublisherInstance) {
    this.withdaw(instance.constructor.name || instance.name, instance);
  }

  get(instance: Subscriber, name: string) {
    if (name && instance && instance.pool instanceof Object) {
      const commit = this.publish(name);

      if (!commit) {
        Publisher.warning(`Unable to get ${name}...`);
      } else {
        instance.pool[name] = commit;
      }
    } else {
      Publisher.warning(`Unable to complete get from ${instance.name}`);
    }
  }

  set(instance: Subscriber, name: string) {
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

    if (!instance.subscriber && !instance.subscriber) {
      Console.error(`Unable to subscribe invalid instance: ${instance.name}`);

      return;
    }

    if (this.instances[name]) {
      Console.warning(
        `Unable to overwrite existing instance: ${name} =>`,
        this.instances[name]
      );

      return;
    }

    // Ensure duplicate Publisher instances are not included
    this.instances[name] = instance;

    if (instance._spawn) {
      Publisher.log(`Constructor subscribed: ${name} => ${instance.name}`);
    } else {
      Publisher.log(
        `Instance subscribed: ${name} => ${instance.name || instance.id}`
      );
    }
  }

  list(instance: any) {
    if (instance) {
      return Object.values(this.instances).filter((i) => i === instance);
    }

    return Object.values(this.instances);
  }

  publish(name: string) {
    if (!name) {
      Publisher.warning("Unable to publish undefined instance.");

      return;
    }

    if (!this.instances[name]) {
      Publisher.warning(
        `Unable to publish: ${name}, you need to subscribe ${name} to the Publisher instance.`
      );

      return;
    }

    return this.instances[name];
  }

  withdaw(name: string, instance: PublisherInstance) {
    if (this.instances[name] && this.instances[name] === instance) {
      // delete this.instances[name];

      Publisher.info(`Subscription withdrawn from: ${this.name} => ${name}`);
    }
  }
}
