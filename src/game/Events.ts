import EventEmitter from "eventemitter3";

export class Events {
  emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  emit(name: string, ...args: any[]) {
    return this.emitter.emit(name, ...args);
  }

  on(name: string, handler: Function, context?: any) {
    return this.emitter.on(name, handler, context);
  }

  off(name: string, handler: Function, context?: any) {
    return this.emitter.off(name, handler, context);
  }
}

const events = new Events();

export default events;
