// https://www.npmjs.com/package/node-cache

export type onKeyExpireCallback = (key: string, value: any) => Promise<void>;

export interface IEventsCacheKey {
    value: any;
    ttl: number;
}

export class ExpirationCache {

    private keys = new Map<string, IEventsCacheKey>();
    private expirationCallbacks: onKeyExpireCallback[] = [];
    private isRunning: boolean = true;
    private timeoutId: any = undefined;

    constructor(private keysDefaultTTL: number = 0) {
        this.runCheckLoop();
    }

    private async runCheckLoop() {   
        if(!this.isRunning) return;

        try {
            console.error("Start loop");
            const allKeys = [...this.keys.keys()];
            for (let index = 0; index < allKeys.length; index++) {
                const key = allKeys[index];
                const value = this.keys.get(key);
                if (value && value.ttl !== 0 && value.ttl < Date.now()) {
                    this.keys.delete(key);
                    try {
                        await this.onKeyExpire(key, value.value);
                    } catch (error) {
                        //debugger
                    }
                }
            }
        } catch (error) {

        } finally {
            console.error("end loop");
            this.timeoutId = setTimeout(() => {
                this.runCheckLoop();
            }, 1000);
        }
    }

    private onKeyExpire(key: string, value: any): Promise<void> {
        return new Promise<void>(async resolve => {
            try {
                for (let index = 0; index < this.expirationCallbacks.length; index++) {
                    const callback = this.expirationCallbacks[index];
                    try {
                        await callback(key, value);
                    } catch (error) {
                        //debugger;
                    }
                }                
            } catch (error) {
                //debugger;
            } finally {
                resolve();
            }
        });
    }

    public registerExpiration(callback: onKeyExpireCallback) {
        if (!callback) {
            throw new Error("callback is null");
        }
        this.expirationCallbacks.push(callback);
    }

    public closeCache() {
        if (!this.isRunning) return;

        this.isRunning = false;

        this.keys.clear();
        if (this.timeoutId != undefined) {
            clearTimeout(this.timeoutId);
        }
    }

    public add(key: string, value: any, ttlInSeconds?: number) {
        const ttl = ttlInSeconds ? ttlInSeconds : this.keysDefaultTTL;
        this.keys.set(key, {
            value: value,
            ttl: Date.now() + (ttl * 1000)
        });
    }

    public getAllKeys(): string[] {
        const result = [...this.keys.keys()];
        return result;
    }

    public deleteAllKeys() {
        this.keys.clear();
    }

    public hasKey(key: string): boolean {
        const result = this.keys.has(key);
        return result;
    }

    public get(key: string): any {
        const result = this.keys.get(key);
        if (result) {
            return result.value;
        }
        return null;
    }

    public remove(key: string): boolean {
        const result = this.keys.delete(key);
        return result;
    }
}