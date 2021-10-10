export type onPropertyChangedCallbackDef<T> = (t: T, name: string, value: any) => void;

const config = require('config');
// https://github.com/lorenwest/node-config

export interface IServerConfig {
    port: number;
    env: string;
    sensorConfig: ISensorConfig;
}

export interface ISensorConfig {
    port: number;
}

export class ConfigurationManager {
    
    public static getServerConfig(): IServerConfig {
        const config = this.getConfig<IServerConfig>('Server');
        return config;
    }

    public static getServerPort(): number {
        const port = this.getServerConfig() ? this.getServerConfig().port : 3100;
        return port;
    }

    private static clone<T>(obj: T) {
        if (!obj) return null;
        const json = JSON.stringify(obj);
        return JSON.parse(json) as T;
    }

    public static getConfig<T>(name: string): T {
        const conf = config.get(name) as T
        if (conf) {
            return conf;
        }

        throw new Error(`Failed to load ${name} Config`);
    }
}