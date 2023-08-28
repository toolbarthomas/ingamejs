import EventEmitter from "eventemitter3";

/**
 * The Eventbus is a wrapper around the Event Emitter module. A singleton
 * instance is created within this entry file that is attached to the running
 * Kernel.
 */
export class EventBus {
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

/**
 * Defines a Global EventBus to use within the bundle that should be used to
 * interchange the Kernel context with any game related context like:
 * scene management, canvas rendering and many more.
 */
const events = new EventBus();

export default events;
