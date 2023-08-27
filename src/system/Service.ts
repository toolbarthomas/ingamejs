import { Core } from "@system/Core";
import { Kernel } from "@system/Kernel";
import { Publisher } from "@system/Publisher";

/**
 * A Service extends upon the Core class constructor and will subscribe any new
 * construction within the defined collection.
 */
export class Service extends Core {
  pool?: Publisher;

  constructor(kernel: Kernel) {
    super(kernel);
  }

  /**
   * Defines a constructed Publisher instance within the Service instance.
   *
   * @param pool The Publisher class to assign.
   */
  definePool(pool: Publisher, name?: string) {
    if (!pool) {
      Service.warning(`Unable to define new pool for ${this.name}`);

      return;
    }

    this.pool = pool;

    Service.info(`Service pool defined:`, this.pool);

    // Subscribe the initial Service within the publisher.
    if (!this.pool.list(this).length) {
      this.pool.subscribe(name || this.name, this);
    }
  }
}
