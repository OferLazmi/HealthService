import { ISensorConfig } from "../configuration/configurationManager";
import { SensorDataModel } from "./SensorDataModel";


export class UsbProvider {

    private subscriberCallback: any;

    public connect(sensorConfig: ISensorConfig) {
    }

    public listenForData(callback: any) {
        this.subscriberCallback = callback;
    }

    private handleSensorData(values: number[][]) {
        this.subscriberCallback(new SensorDataModel(values));
    }
}
