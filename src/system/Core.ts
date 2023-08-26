import { ApplicationConfiguration, InstanceConfiguration } from "thundershock";

import { Kernel } from "@system/Kernel";
import { Console } from "@system/Console";
import { validateConfiguration } from "@/system/config";

/**
 * Implements the Core functionality for the private modules that share the
 * running Kernel instance.
 */
export class Core extends Console {
  config: ApplicationConfiguration;
  kernel: Kernel;
  name: string;

  constructor(kernel: Kernel, config?: ApplicationConfiguration) {
    super();

    if (!kernel || kernel instanceof Kernel === false) {
      throw Error(
        `Unable to create ${this.constructor.name} with undefined kernel.`
      );
    }

    this.kernel = kernel;

    this.name = this.constructor.name;

    this.config = validateConfiguration(config)
      ? (config as ApplicationConfiguration)
      : kernel.config;

    Core.log(this.name, this.kernel, this);
  }
}
