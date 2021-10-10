import { v4 as uuidv4 } from 'uuid';
import { StopWatch } from './stopwatch';
const moment = require('moment');

export class Utils {

    private static isDebug: boolean;

    public static generateGuid(): string {
        return uuidv4();
    }

    public static async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public static truncateNumber(num: number, digits: number): number {
        const truncate = Math.trunc(num * Math.pow(10, digits)) / Math.pow(10, digits);
        return truncate;
    }

    public static noError() {
        return null; // todo ?
    }

    public static roundNumber(num, dec, shouldTruncate: boolean = true) {
        const round = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        if (shouldTruncate) {
            return Utils.truncateNumber(round, dec);
        }
        return round;
    }

    public static floorNumber(num, dec, shouldTruncate: boolean = true) {
        const round = Math.floor(num * Math.pow(10, dec)) / Math.pow(10, dec);
        if (shouldTruncate) {
            return Utils.truncateNumber(round, dec);
        }
        return round;
    }

    public static async measureOperationTime(callback: any): Promise<any> {
        const stopwatch = new StopWatch();
        stopwatch.start();
        await callback();
        stopwatch.stop();
        const delta = stopwatch.read();
        return delta;
    }

    public static convertTimestampToDate(timestamp: number): Date {
        var date = new Date(0);
        if (timestamp.toString().length > 10) {
            timestamp = timestamp / 1000;
        }
        date.setUTCSeconds(timestamp);
        return moment(date).utcOffset(0, true).format();
    }
}