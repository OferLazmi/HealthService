
const now = require('performance-now');

export class StopWatch {

    private startTime: number;
    private stopTime: number;

    constructor() {

    }


    public start() {
        this.startTime = now();
    }

    public stop() {
        this.stopTime = now();
    }

    public read(): number {
        let delta;

        if (this.startTime) {
            let nowTime;
            if (this.stopTime) {
                nowTime = this.stopTime;
            } else {
                nowTime = now();
            }

            delta = nowTime - this.startTime;
            delta = Number(delta.toFixed(0));
        } else {
            delta = NaN;
        }

        return delta;

    }
}