import { IQueueManager } from './iQueueManager';
export type onDataArrivedCallbackDef = (data: any, queue: IQueueManager) => Promise<void>;
export type onErrorCallbackDef = (error: any) => Promise<void>;

export class QueueManager implements IQueueManager {
    private queue: any[] = [];

    constructor(
        private onDataArrivedCallback: onDataArrivedCallbackDef,
        private onErrorCallback?: onErrorCallbackDef) {

        if (!this.onDataArrivedCallback) {
            throw new Error("this.onDataArrivedCallback can't be null");
        }

        this.dequeue();
    }

    public enqueue(item: any) {
        this.queue.push(item);
    }

    public count(): number {
        return this.queue.length;
    }

    public empty(): void {
        this.queue = [];
    }

    private dequeue() {
        const timerId = setTimeout(async () => {
            clearTimeout(timerId);
            try {
                let item = this.queue.shift();
                if (!item) {
                    await this.wait(1);
                    return;
                }

                do {
                    try {
                        await this.onDataArrivedCallback(item, this);
                    } catch (error) {
                        if (this.onErrorCallback) {
                            try {
                                this.onErrorCallback(error);
                            } catch (error) { }
                        }
                    }
                    item = this.queue.shift();
                } while (item);
            } catch (error) {
                if (this.onErrorCallback) {
                    try {
                        this.onErrorCallback(error);
                    } catch (error) { }
                }
            } finally {
                this.dequeue();
            }
        }, 1);
    }

    private async wait(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
