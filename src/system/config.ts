import { ApplicationConfiguration, InstanceConfiguration } from "thundershock";

import config from "@/thundershock.config";

import { Core } from "@system/Core";
/**
 * Defines the initial custom configuration with the default fallback values.
 */
export const defineConfiguration = (props: any) => {
  const commit: any = {
    ...config,
  };

  if (props instanceof Object) {
    Object.entries(props).forEach(([key, value]) => {
      if (commit[key] && typeof value === typeof commit[key]) {
        commit[key] = value;

        Core.info(`Configuration option updated: ${key}:`, value);
      } else {
        Core.warning(
          `Unsupported configuration option detected: ${key} => ${typeof value}`
        );
      }
    });
  } else {
    Core.log(`Unable to define custom configuration with any properties...`);
  }

  return commit as ApplicationConfiguration;
};

/**
 * Validates the given configuration with the default Application configuration.
 *
 * @param props The configuration Object to validate.
 */
export const validateConfiguration = (props: any) => {
  let result = true;

  if (!props || props instanceof Object === false) {
    result = false;
  } else {
    Object.entries(props).forEach(([key, value]) => {
      if (!props[key]) {
        result = false;
      }

      if (typeof value !== typeof (config as any)[key]) {
        result = false;
      }
    });
  }

  return result;
};
