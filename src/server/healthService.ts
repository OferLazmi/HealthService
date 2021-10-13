import { IServerConfig } from "../configuration/configurationManager";
import { HealthSensorHandler } from "./HealthSensorHandler";


export class HealthService {
    private healthSensorHandler: HealthSensorHandler;

    constructor(serverConfig: IServerConfig) {
        this.healthSensorHandler = new HealthSensorHandler(serverConfig);
    }

    public run() {
        //this.healthSensorHandler.test();
        this.healthSensorHandler.start();
    }
}

//let a : HealthService = new HealthService();
//a.run();
