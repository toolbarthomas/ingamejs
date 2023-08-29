import { Entry } from "@system/Entry";

/**
 * Defines the expected message count to use within the Console. By default it
 * should reset from the defined value, this should be around 30 seconds if the
 * default framerate is used within the application.
 *
 * Clearing the console can timeout the next frame so it is advices to disable
 * any console usage within production.
 */
export const consoleMaxMessageCount = 60 * 30;

// Keep track of the amount written console messages that will reset itself.
let consoleMessageCount = 0;

/**
 * Console helper to use instead of the default console.
 */
export class Console extends Entry {
  name: string;

  constructor() {
    super();

    this.name = this.constructor.name;
  }

  /**
   * Console helper that use the console.error method, the output is not cleared
   * while using this method but should throw an Exception.
   *
   * @param args Any console argument to use.
   */
  static error(...args: any) {
    Console.use("error", ...args);
  }

  /**
   * Console helper that should clear the output to minimize frame lag during
   * development.
   *
   * @param args Any console argument to use.
   */
  static log(...args: any) {
    const { verbose } = Console.config.console || {};

    if (!verbose)
      if (consoleMessageCount === consoleMaxMessageCount) {
        Console.use("clear");
      }

    verbose && Console.use("log", ...args);
  }

  // Alias to the now timestamp methods.
  static now() {
    return performance.now() || Date.now();
  }

  /**
   * Default Console helper that could be used within a production environment.
   * This method should be used only for outputting common information that does
   * not mutate often.
   *
   * @param args Any console argument to use.
   */
  static info(...args: any) {
    Console.use("info", ...args);
  }

  /**
   * Console helper that will reset every x amount of method uses.
   *
   * @param type The Console method to call.
   * @param args Any Console related parameter.
   */
  static use(type = "log", ...args: any) {
    const c = globalThis.console as globalThis.Console;

    //@ts-ignore
    if (globalThis.console[type]) {
      //@ts-ignore
      globalThis.console[type](...args);

      consoleMessageCount += 1;
    }
  }

  /**
   * Console helper that use the console.warn method, the output is not cleared
   * while using this method.
   *
   * @param args Any console argument to use.
   */
  static warning(...args: any) {
    Console.use("warn", ...args);
  }
}
