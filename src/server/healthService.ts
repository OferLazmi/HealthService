import { IServerConfig } from "../configuration/configurationManager";
import { HealthSensorHandler } from "./HealthSensorHandler";
import { MovementState } from "./MovementState";
import { SensorDataModel } from "./SensorDataModel";


export class HealthService {
    private healthSensorHandler: HealthSensorHandler;

    constructor(serverConfig: IServerConfig) {
        this.healthSensorHandler = new HealthSensorHandler(serverConfig);
    }

    public run() {
        //this.healthSensorHandler.test();
        this.healthSensorHandler.start();
    }

    public getSnapshot(): [SensorDataModel, SensorDataModel, MovementState, number, number] {
        return this.healthSensorHandler.getSnapshot();
    }
}

//let a : HealthService = new HealthService();
//a.run();
