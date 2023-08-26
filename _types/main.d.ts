import { AnimationThreadProps } from "@toolbarthomas/animation-thread/src/_types/main";
import { AnimationThread } from "@toolbarthomas/animation-thread";

/**
 * Defines the expected configuration Object to use within the running
 * application.
 */
export type ApplicationConfiguration = {
  display: {
    fps: number;
    id: string;
  };
};

/**
 * Defines the expected function that is called within the Kernel.tick() method.
 */
export type ApplicationHandler = {
  // Optional benchmarked duration of the defined handler.
  duration?: number;

  // Optional idleCallback ID value to reset for each throttled tick.
  idle?: number;

  // Should match with an existing Kernel thread.
  name: TimerSubscribtionName;

  // Additional options that is used during the attachment.
  options?: {
    // Use the defined function handler only once and remove it at the end of
    // the initial frame.
    once?: boolean;
  };

  // Optional Worker that will be created when the attached handler slows down
  // the main thread.
  worker?: Worker;

  // The actual frame handler.
  fn: (props: AnimationThreadProps, tick: number, clean: boolean) => void;

  // Defines the tick value of the last frame the handler was used.
  tick?: number;
};

/**
 * Defines the optional configuration that can be assigned to the actual
 * ApplicationConfiguration type.
 */
export type InstanceConfiguration = {
  display?: {
    fps?: ApplicationConfiguration["display"]["fps"];
    id?: ApplicationConfiguration["display"]["id"];
  };
};

export interface DefaultOptions {
  config?: ApplicationConfiguration;
}

/**
 * Defines the custom options for the constructed Timer instance.
 */
export interface TimerOptions extends DefaultOptions {
  autostart?: boolean;
}

export type TimerSubscriptionHandler = (
  props: AnimationThreadProps,
  tick: number,
  clean: boolean
) => void;

/**
 * Value to use during Timer.subscribe()
 */
export type TimerSubscribtionName = string;

/**
 * Defines the optional Timer subscription options to use within the
 * subscription method.
 */
export type TimerSubscribtionOptions = {
  fps?: ApplicationConfiguration["display"]["fps"];
};

/**
 * Defines the assigned Timer instances that should interact with the game loop.
 */
export type TimerSubscribtions = {
  [key: TimerSubscribtionName]: AnimationThread;
};
