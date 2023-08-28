import { Camera } from "@/display/Camera";
import { Game } from "@game/Game";

import { SCENE_CHANGE } from "@event/eventTypes";

import { SceneProps } from "thundershock";

export class Scene extends Game {
  cameras: Camera["name"][] = [];
  id: string;
  name: string;
  active?: boolean;

  handleInit?: SceneProps["init"];

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

  addObject() {}

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
  attachCameras(cameras: Scene["cameras"]) {
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

  getCamera(name = Camera.defaults.name) {
    this.get(name);

    if (this.pool[name] && this.pool[name] instanceof Camera) {
      return this.pool[name] as Camera;
    } else if (this.pool[name]) {
      delete this.pool[name];
    }
  }

  /**
   * Switchs to the defined Scene and mark it as active.
   *
   * @param cache Call the create handler or try to use the cache when TRUE.
   */
  start(cache?: boolean) {
    this.active = true;

    super.start();
  }

  /**
   * Switch to the selected scene and clear any included libraries for the
   * inactive Scenes.
   *
   * @param scene Switch to the selected scene.
   */
  switch(scene?: Scene) {
    if (scene === this) {
      this.create();
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
