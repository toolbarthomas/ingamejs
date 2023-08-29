import { AnimationThread } from "@toolbarthomas/animation-thread";
import { AnimationThreadProps } from "@toolbarthomas/animation-thread/src/_types/main";

import { Kernel } from "@system/Kernel";
import { Camera } from "@display/Camera";

import { Game } from "@game/Game";
import { GameObject } from "@game/GameObject";
import { ImageObject } from "@game/ImageObject";
import { Scene } from "@game/Scene";

/**
 * Defines the expected configuration Object to use within the running
 * application.
 */
export type ApplicationConfiguration = {
  console: {
    verbose?: boolean;
  };
  display: {
    alpha?: boolean;

    // Run the main loop within the defined FPS value.
    fps: number;

    // The initial height for the display.
    height: number;

    // The id property value to use within the Render target.
    id: string;

    // Renders the application within the selected context, more options could
    // be supported in the future.
    type: "2d";

    // The initial width for the display.
    width: number;
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
  options: {
    // Use the defined function handler only once and remove it at the end of
    // the initial frame.
    once?: boolean;

    // Prevent the usage of Web Worker for the defined Handler.
    main?: boolean;

    // Call the actual handler after the given delay in ms.
    delay?: number;
  };

  // Optional Worker that will be created when the attached handler slows down
  // the main thread.
  worker?: Worker;

  // The actual frame handler.
  fn: TimerSubscriptionHandler;

  // Defines the tick value of the last frame the handler was used.
  tick?: number;

  timeout?: number;

  // The timestamp during the attachment of the handler.
  timestamp: number;
};

/**
 * Properites to use when constructing a new Camera instance.
 */
export type CameraProps = {
  height?: number;
  name?: string;
  width?: number;
  x?: number;
  y?: number;
};

/**
 * The Canvas element to use for the application.
 */
export type CanvasManagerContext = {
  // Canvas container that renders the actual Game
  display: HTMLCanvasElement;

  // Canvas container that renders the Game objects.
  pipeline: HTMLCanvasElement;
};

/**
 * Defines the default options to use when extending from the Core class.
 */
export interface DefaultOptions {
  config?: ApplicationConfiguration;
}

export type EventHandler = (...args: any[]) => void;

/**
 * Reference to the actual frame related properties defined
 * @toolbarthomas/animation-thread.
 */
export type FrameProps = AnimationThreadProps;

export interface GameProps {
  id: Game["id"];
  name?: Game["name"];
  create?: Game["handleCreate"];
  init?: Game["handleInit"];
  preload?: Game["handlePreload"];
  start?: Game["handleStart"];
}

export interface GameObjectProps {
  x: GameObject["x"];
  y: GameObject["y"];
  width: GameObject["width"];
  height: GameObject["height"];
}

export interface ImageObjectProps extends GameObjectProps {
  src: ImageObject["src"];
}

export type GameObjects = GameObject;
export type GameHandler = (context: any) => void;
export type GameHandlerAsync = (
  callback: (value: number) => void,
  context: any
) => void;
/**
 * Defines the optional configuration that can be assigned to the actual
 * ApplicationConfiguration type.
 */
export type InstanceConfiguration = {
  console?: {
    verbose?: ApplicationConfiguration["console"]["verbose"];
  };
  display?: {
    alpha?: ApplicationConfiguration["display"]["alpha"];
    fps?: ApplicationConfiguration["display"]["fps"];
    height?: ApplicationConfiguration["display"]["height"];
    id?: ApplicationConfiguration["display"]["id"];
    type?: ApplicationConfiguration["display"]["type"];
    width?: ApplicationConfiguration["display"]["width"];
  };
};

export type PublisherInstance = Camera | GameObjects;
export type PublisherInstances = { [key: string]: PublisherInstance };

export interface RenderEngineOptions extends DefaultOptions {
  target: CanvasManagerContext;
}

export interface SceneProps extends GameProps {
  active?: Scene["active"];
  cameras?: Scene["cameras"];
  id: Scene["id"];
}

/**
 * Defines the custom options for the constructed Timer instance.
 */
export interface TimerOptions extends DefaultOptions {
  autostart?: boolean;
}

/**
 * Subscription handlers are assigned to the Kernel queue that should run each
 * tick from the defined animation thread. This meanse that the attached name
 * should match with the animation thread in order to be called for each tick.
 */
export type TimerSubscriptionHandler = (
  // Context properties defined from the requestAnimationFrame usage.
  props: FrameProps,
  // Tick value that should match with the current frame tick, the handler will
  // be throttled if the offset is too high.
  tick: number,

  // Will be true if there is no large tick offset or frame delay.
  clean: boolean,

  // Optional reference to the constructed Kernel instance.
  root?: Kernel
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
