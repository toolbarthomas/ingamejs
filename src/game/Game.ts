import { GameHandler, GameHandlerAsync, GameProps } from "thundershock";

import { Subscriber } from "@/system/Subscriber";
import { Kernel } from "@/system/Kernel";

export class Game extends Subscriber {
  id: string;
  name: string;
  handleCreate?: GameHandler;
  handleInit?: GameHandler;
  handlePreload?: GameHandlerAsync;
  handleStart?: GameHandler;
  lastCreate?: number;
  lastInit?: number;
  lastPreload?: number;
  lastStart?: number;
  preloaded?: boolean;
  preloading?: boolean;

  constructor(props: GameProps) {
    super();

    const { create, id, name, init, preload, start } = props || {};

    this.id = id;

    this.name = name || this.constructor.name;

    this.handleCreate = create;
    this.handleInit = init;
    this.handlePreload = preload;
    this.handleStart = start;

    this.init();
  }

  /**
   * The entry handler that will be called after the preload handler and before
   * the start handler. For example: A scene should use this method to define
   * the Game Objects for the scene.
   */
  create() {
    if (typeof this.handleCreate === "function") {
      this.handleCreate && this.handleCreate(this);
      this.lastCreate = Game.now();
    }
  }

  /**
   * The entry handler that will be called during the construction of the Game
   * instance.
   */
  init() {
    if (typeof this.handleInit === "function") {
      this.handleInit && this.handleInit(this);

      this.lastInit = Game.now();
    }
  }

  /**
   * The entry handler that will be called before the other handlers: create &
   * start.
   */
  preload() {
    const request = new Promise<number>((resolve) => {
      if (this.preloading) {
        resolve(409);
      }

      if (!this.preloading && typeof this.handlePreload === "function") {
        this.handlePreload && this.handlePreload(resolve, this);

        this.lastPreload = Game.now();

        this.preloading = true;
      } else {
        resolve(204);
        this.preloaded = false;
      }
    });

    try {
      request.then((status) => {
        if (status !== 409) {
          this.preloading = false;
          this.preloaded = true;

          Game.info(`Preload completed: ${this.name}`);
        }
      });
    } catch (exception) {
      Game.error(exception);
    }

    return request;
  }

  /**
   * The entry start handler that should be called at the end of the other
   * methods: create, preload, init,
   */
  start() {
    if (typeof this.handleStart === "function") {
      if (this.preloaded) {
        this.create();
        this.handleStart && this.handleStart(this);
      } else {
        this.preload().then(() => {
          this.create();
          this.handleStart && this.handleStart(this);

          this.lastStart = Game.now();
        });
      }
    }
  }
}
