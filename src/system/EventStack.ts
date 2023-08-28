import events, { EventBus } from "@event/Eventbus";
import { PUBLISHER_GET, PUBLISHER_SET } from "@/event/eventTypes";

import { Console } from "@system/Console";
import { Publisher } from "@system/Publisher";

/**
 * The EventStack implements the constructed Event Emitter and enables the
 * usage of parent Class instances within the EventStack Class.
 */
export class EventStack extends Console {
  events: EventBus;
  pool: Publisher = {};

  constructor() {
    super();

    this.events = events;
  }

  /**
   * Clears the defined Publisher instance.
   */
  clearPool() {
    if (this.pool) {
      const keys = Object.keys(this.pool);

      this.pool = {};

      Console.log(`${this.name} service pool cleared: ${keys.join(", ")}`);
    }
  }

  /**
   * Event handler that will be used during a PUBLISHER_GET event. The
   * requested library will be attached to the instance that uses the get
   * method.
   *
   * @param name The name of the subscribed Publisher instance.
   */
  get(name: string) {
    this.events.emit(PUBLISHER_GET, this, name);

    return this.pool && this.pool[name];
  }

  /**
   * Event handler that will set this instance to the constructed Publisher
   * instances.
   *
   * @param name The name for the Publisher subscription.
   */
  set(name: string) {
    this.events.emit(PUBLISHER_SET, this, name);
  }
}
