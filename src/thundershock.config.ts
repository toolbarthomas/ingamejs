import { ApplicationConfiguration } from "thundershock";

/**
 * Defines the default Thundershock application configuration.
 */
export const config: ApplicationConfiguration = {
  console: {
    verbose: false,
  },
  display: {
    fps: 60,
    height: 600,
    id: "thundershock",
    type: "2d",
    width: 800,
    alpha: false,
  },
};

export default config;
