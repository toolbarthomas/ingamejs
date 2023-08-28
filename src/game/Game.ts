import { GameHandler, GameHandlerAsync, GameProps } from "thundershock";

import { EventStack } from "@/system/EventStack";
import { Kernel } from "@/system/Kernel";

export class Game extends EventStack {
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

  create() {
    if (typeof this.handleCreate === "function") {
      this.handleCreate(this);
      this.lastCreate = Game.now();
    }
  }

  init() {
    if (typeof this.handleInit === "function") {
      this.handleInit(this);

      this.lastInit = Game.now();
    }
  }

  preload() {
    const request = new Promise<number>((resolve) => {
      if (this.preloading) {
        resolve(409);
      }

      if (!this.preloading && typeof this.handlePreload === "function") {
        this.handlePreload(resolve, this);

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

  start() {
    if (typeof this.handleStart === "function") {
      if (this.preloaded) {
        this.create();
        this.handleStart(this);
      } else {
        this.preload().then(() => {
          this.create();
          this.handleStart(this);

          this.lastStart = Game.now();
        });
      }
    }
  }
}
