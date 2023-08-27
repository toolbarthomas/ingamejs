import { Camera } from "@/display/Camera";
import { Console } from "@system/Console";

import { SceneProps } from "thundershock";

export class Scene extends Console {
  cameras: Camera["name"][] = [];
  id: string;
  active?: boolean;

  static defaults = {
    active: false,
    id: "scene",
  };

  constructor(props: SceneProps) {
    super();

    const { active, cameras, id } = props || {};

    this.active = active || Scene.defaults.active;
    this.id = id || Scene.defaults.id;

    this.defineCameras(cameras);

    Scene.info(`Scene created: ${this.id}`);
  }

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

  clearCameras() {
    [...this.cameras].forEach((camera) => this.clearCamera(camera));
  }

  defineCameras(cameras: Scene["cameras"]) {
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

  defineCamera(name: Camera["name"]) {
    if (!name) {
      Scene.warning(`Unable to define undefined camera.`);

      return;
    }

    if (Array.isArray(this.cameras) && !this.cameras.includes(name)) {
      this.cameras.push(name);

      Scene.info(`Camera defined: ${this.id} => ${name}`);
    }
  }
}
