import { Log } from "./logger";

export class ScopeLog {
    constructor(
        private name: string,
        private isDebug: boolean = true) {
    }

    public info(message: any, ...args: any[]) {
        Log.instance.info(`[${this.name}] ${message}`, args);
    }

    public warn(message: any, ...args: any[]) {
        Log.instance.warn(`[${this.name}] ${message}`, args);
    }

    public error(message: any, ...args: any[]) {
        Log.instance.error(`[${this.name}] ${message}`, args);
    }

    public fatal(message: any, ...args: any[]) {
        Log.instance.fatal(`[${this.name}] ${message}`, args);
    }

    public debug(message: any, ...args: any[]) {
        Log.instance.debug(`[${this.name}] ${message}`, args);
    }

    public trace(message: any, ...args: any[]) {
        Log.instance.trace(`[${this.name}] ${message}`, args);
    }
}
