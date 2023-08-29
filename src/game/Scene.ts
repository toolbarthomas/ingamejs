import { Camera } from "@display/Camera";
import { Game } from "@game/Game";

import { PUBLISHER_DELETE, SCENE_CHANGE } from "@event/eventTypes";

import {
  GameObjectProps,
  GameObjects,
  GameProps,
  ImageObjectProps,
  SceneProps,
} from "thundershock";
import { GameObject } from "./GameObject";

/**
 * The Scene class is the main interface for constructing the actual game.
 * This interface is exposed within a Thundershock application via
 * Thundershock.addScene('Name', ...). Where the create, update, init & start
 * handlers can be defined that will setup the actual Scene.
 *
 * You can request any subscribed Service pool library on demand within the
 * mentioned handlers by using Scene.get().
 * This will request the existing library like the Rendering Engine, GameObject
 * constructor and many more.
 *
 * Only 1 Scene can be active for the actual game but multiple camera's can be
 * used within the Scene. See @display/Camera for more information about this.
 * The active property will updated during a SCENE_CHANGE event and will be
 * TRUE if the given context matches with the defined Scene.
 *
 */
export class Scene extends Game {
  cameras: Camera["name"][] = [];
  created?: boolean;
  active?: boolean;

  /**
   * Containes all the created Game Objects for the current scene. A copy of
   * the unique visual result will be rendered within the Canvas Pipeline that
   * is shared by the actual display. This means that duplciate Object entries
   * (with matching transformation values) are fetched from the single result
   * within the pipeline. Multiple variants of the constructed Game Object will
   * be rendered within the pipeline if there is more than 1 Camera defined for
   * the current Scene.
   */
  private _gameObjects: { [key: string]: GameObjects } = {};

  static defaults = {
    active: false,
    id: "scene",
  };

  constructor(props: SceneProps) {
    const { active, cameras, create, name, id, init, preload, start } =
      props || {};

    super({ create, id, init, name, preload, start });

    this.id = id || Scene.defaults.id;

    this.attachCameras(cameras);

    this.events.on(SCENE_CHANGE, this.toggle, this);

    Scene.info(`Scene created: ${this.id}`);

    this.init();

    active && this.switch();
  }

  /**
   * Adds a new Object to the current scene.
   */
  add(type: any, props: GameObjectProps | ImageObjectProps) {
    this.get(type);

    let instance: any;

    try {
      const [base64] = btoa(JSON.stringify(props || {})).split("=");
      const id = `${type}__${base64}`;

      if (this._gameObjects[id]) {
        Scene.warning(`Unable to add identical Object to scene: ${id}`);
        instance = this._gameObjects[id];
      } else if (Object.keys(this.pool).includes(type)) {
        instance = new (this.pool as any)[type](id, props);

        if (typeof instance.init === "function") {
          instance.init();
        }

        this._gameObjects[id] = instance;
      }
    } catch (exception) {
      if (exception) {
        Scene.error(exception);
      }
    }

    if (!instance) {
      Scene.error(`Unable to add undefined ${type} to current scene.`);
    }

    return instance as GameObject;
  }

  /**
   * Attach a Camera nameto the current Scene, keep in mind they still need to
   * be requested from the pool.
   *
   * @param name The name of the Camera to attach.
   */
  attachCamera(name: Camera["name"]) {
    if (!name) {
      Scene.warning(`Unable to define undefined camera.`);

      return;
    }

    if (Array.isArray(this.cameras) && !this.cameras.includes(name)) {
      this.cameras.push(name);

      Scene.info(`Camera defined: ${this.id} => ${name}`);
    }
  }

  /**
   * Attaches the selected Camera names to the current Scene, keep in mind that
   * they still need to be requested from the pool.
   */
  attachCameras(cameras?: Scene["cameras"]) {
    if (Array.isArray(cameras)) {
      this.cameras = [...new Set([...(this.cameras || []), ...cameras])];
    } else if (!this.cameras) {
      this.cameras = [];
    }

    this.cameras.length &&
      Scene.info(
        `Cameras defined to: ${this.id} => ${this.cameras.join(", ")}`
      );
  }

  /**
   * Clears the assigned Camera instance from the current Scene.
   *
   * @param name The name of the Camera instance to remove from the Scene.
   */
  clearCamera(name: string) {
    if (!name) {
      Scene.warning(`Unable to clear camera from scene: ${this.id}`);

      return false;
    }

    this.cameras = this.cameras.filter(
      (camera) => camera.toLowerCase() !== name.toLowerCase()
    );

    Scene.info(`Camera cleared: ${this.id} => ${name}`);

    return true;
  }

  /**
   * Clears all the attached Camera instances from the current Scene.
   */
  clearCameras() {
    [...this.cameras].forEach((camera) => this.clearCamera(camera));
  }

  create() {
    if (!this.created) {
      Scene.info(`Create scene: ${this.id}`);

      super.create();
      this.created = true;
    }
  }

  /**
   * Removes the created Game Objects from the defined scene and reset the
   * additional scene flags and notify the camera to ignore the current Scene.
   */
  destroy() {
    if (this._gameObjects instanceof Object) {
      const entries = Object.entries(this._gameObjects);

      entries.forEach(([name, gameObject]) => {
        delete this._gameObjects[name];

        this.events.emit(PUBLISHER_DELETE, gameObject);
      });
    }

    this.preloaded = false;
    this.created = false;

    this.active = false;

    this.events.emit(SCENE_CHANGE);

    Scene.info(`Scene destroyed`, this);
  }

  preload() {
    return new Promise<number>(async (resolve) => {
      // Handle the attached preload handler to ensure all the required Game
      // Objects are defined within the Scene.
      await super.preload();
      // Preload all the attached GameObject from the current scene for the
      // Objects that use that actual preload method interface.
      const queue = Object.values(this._gameObjects)
        .map((gameObject) => {
          if (typeof gameObject.preload === "function") {
            return gameObject.preload();
          }

          return undefined;
        })
        .filter((obj) => obj !== undefined);

      if (queue.length) {
        Scene.info(`Scene preloaded, loading existing game Objects:`);
      }

      Promise.all(queue).then((result) => {
        Scene.info(`Game Objects loaded for scene: ${this.id}`);

        resolve(200);
      });
    });
  }

  /**
   * Ensure the existing Camera is returned since various instance types are
   * present within the Scene pool.
   *
   * @param name The name of the existing Camera to return
   */
  getCamera(name = Camera.defaults.name) {
    this.get(name);

    if (this.pool[name] && this.pool[name] instanceof Camera) {
      const pool: unknown = this.pool[name];

      return pool as Camera;
    }

    return;
  }

  /**
   * Switchs to the defined Scene and mark it as active.
   *
   * @param cache Call the create handler or try to use the cache when TRUE.
   */
  start(cache?: boolean) {
    this.active = true;

    this.switch(this);

    super.start();
  }

  /**
   * Switch to the selected scene and clear any included libraries for the
   * inactive Scenes.
   *
   * @param scene Switch to the selected scene.
   */
  switch(scene?: Scene) {
    if (scene === this && this.preloaded) {
      this.create();
    } else if (scene && scene !== this) {
      this.destroy();
    }

    this.events.emit(SCENE_CHANGE, scene || this);
  }

  /**
   * Toggles the active state during a scene switch. All existing scenes will be
   * updated since there can only be 1 active scene.
   *
   * @param scene Compare the defined scene with the constructed scene.
   */
  toggle(scene: Scene) {
    if (this.active && scene !== this) {
      this.active = false;
    }

    if (scene === this && !this.active) {
      this.active = true;

      this.create();
      this.start();
    }

    if (!this.active) {
      this.clearPool();
    }
  }
}
