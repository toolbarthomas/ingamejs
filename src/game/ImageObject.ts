import { GameObject } from "@game/GameObject";
import { ImageObjectProps } from "thundershock";

export class ImageObject extends GameObject {
  image?: HTMLImageElement;
  src: string;

  constructor(name: string, props: ImageObjectProps) {
    super(name, props);

    const { height, src, width } = props || {};

    this.src = src;

    if (!this.src) {
      this.invalid = true;
    }
  }

  init() {
    if (this.src && this.src.length) {
      this.image = new Image(this.width, this.height);
    }
  }

  preload() {
    return new Promise<number>((resolve) => {
      if (this.image && this.image instanceof HTMLImageElement) {
        this.image?.addEventListener(
          "load",
          () => {
            ImageObject.info(`Image preloaded: ${this.src}`);

            resolve(200);
          },
          { once: true }
        );

        this.image.src = this.src;
      }
    });
  }
}
