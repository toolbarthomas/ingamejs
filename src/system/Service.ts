import { Core } from "@system/Core";
import { Kernel } from "@system/Kernel";

/**
 * A Service extends upon the Core class constructor and will subscribe any new
 * construction within the defined collection.
 */
export class Service extends Core {
  constructor(kernel: Kernel) {
    super(kernel);
  }
}
