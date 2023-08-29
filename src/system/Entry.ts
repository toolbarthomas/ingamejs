import events from "@event/EventBus";
import { KERNEL_INIT } from "@event/eventTypes";

import { ApplicationConfiguration, InstanceConfiguration } from "thundershock";

/**
 * Entry class definition that defines the required Kernel Event handlers for
 * the requested Class constructors.
 */
export class Entry {
  static config: InstanceConfiguration = {};

  constructor() {
    events.on(
      KERNEL_INIT,
      (config: ApplicationConfiguration) => {
        Entry.config = { ...Entry.config, ...config };
      },
      this
    );
  }
}
