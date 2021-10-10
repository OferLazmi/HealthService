import { configure, getLogger, Logger } from "log4js";

export class Log {

    logger: Logger;
    static instanceLog: Log;

    public static get instance(): Log {

        if (Log.instanceLog == null) {
            console.log("init log...");
            Log.instanceLog = new Log();
            Log.instanceLog.logger = getLogger("app");

            configure({
                appenders: {
                    console: { type: 'console' },
                    app: { type: 'file', filename: 'application.log' }
                },
                categories: {
                    default: {
                        appenders: [
                            // 'app',
                            'console'
                        ], level: 'debug'
                    }
                }
            });
        }

        return Log.instanceLog;
    }

    info(message: any, ...args: any[]) {
        this.logger.info(message, args && args.length > 0 ? args : null)
    }

    warn(message: any, ...args: any[]) {
        this.logger.warn(message, args && args.length > 0 ? args : null)
    }

    error(message: any, ...args: any[]) {
        this.logger.error(message, args && args.length > 0 ? args : null)
    }

    fatal(message: any, ...args: any[]) {
        this.logger.fatal(message, args && args.length > 0 ? args : null)
    }

    debug(message: any, ...args: any[]) {
        this.logger.debug(message, args && args.length > 0 ? args : null)
    }

    trace(message: any, ...args: any[]) {
        this.logger.trace(message, args && args.length > 0 ? args : null)
    }
}