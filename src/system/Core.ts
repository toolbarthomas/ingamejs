export type Props = {
  name: string;
};

export class Core {
  name: string;

  constructor(props: Props) {
    const { name } = props || {};

    this.name = name || this.constructor.name;
  }
}
