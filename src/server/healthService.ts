import { ISensorConfig, IServerConfig } from "src/configuration/configurationManager";


export class SensorDataModel {
    public values = [];

    constructor(values: []) {
        this.values = values;
    }
}

export class UsbProvider {

    private sensorDataGenerator: SensorDataGenerator;
    private subscriberCallback: any;

    public connect(sensorConfig: ISensorConfig) {
        this.sensorDataGenerator = new SensorDataGenerator(this.handleSensorData.bind(this));
    }

    public listenForData(callback: any) {
        this.subscriberCallback = callback;
        this.sensorDataGenerator.run();
    }

    private handleSensorData(values: []) {
        this.subscriberCallback(new SensorDataModel(values))
    }
}

export class SensorDataGenerator {
    private values = [];
    private isRunning: boolean = false;
    private xSize: number = 10;
    private ySize: number = 10;

    constructor(private handleSensorData) {

    }

    public run() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;

        this.generateSensorData();
    }

    private generateSensorData() {
        setTimeout(() => {
            try {
                this.values = [];
                for (let x = 0; x < this.xSize; x++) {
                    const row = [];
                    for (let y = 0; y < this.ySize; y++) {
                        var time = new Date().getSeconds();
                        row.push(time);
                    }
                    this.values.push(row);
                }
                this.handleSensorData(this.values);
            } catch (error) {

            } finally {
                this.generateSensorData();
            }
        }, 1000);
    }
}

export enum MovementState {
    Idle,
    Monitor,
    Movement,
    MoveToPosition
}

export class HealthSensorHandler {

    private usbProvider: UsbProvider;
    private preValues: SensorDataModel;
    private state: MovementState = MovementState.Idle;

    constructor(private serverConfig: IServerConfig) {
        this.usbProvider = new UsbProvider();
    }

    public start() {
        this.usbProvider.connect(this.serverConfig.sensorConfig);
        this.usbProvider.listenForData(this.onSensorDataArrive.bind(this));
    }

    private onSensorDataArrive(data: SensorDataModel) {
        this.handleState(data);
    }

    private isChanged(data: SensorDataModel): boolean {
        if (!this.preValues) {
            return true;
        }

        let changeCount = 0;
        for (let x = 0; x < data.values.length; x++) {
            const item = data.values[x];
            for (let y = 0; y < item.length; y++) {
                if (item[y] !== this.preValues.values[x][y]) {
                    changeCount++;
                }
            }
        }

        const threshold = changeCount / (data.values.length * data.values[0].length);
        return threshold > 0.8;
    }

    private handleState(data: SensorDataModel) {
        switch (this.state) {
            case MovementState.Idle: {
                this.handleIdleState(data);                
                break;
            }
            case MovementState.Monitor: {
                this.handleMonitorState(data);
                break;
            }
            case MovementState.Movement: {
                this.handleMovementState(data);
                break;
            }
            case MovementState.MoveToPosition: {
                this.handleMoveToPositionState(data);
                break;
            }
        }
    }

    private handleIdleState(data: SensorDataModel) {
        if (!this.isChanged(data)) {
            this.preValues = data;
            return;
        }
        this.state = MovementState.Monitor;
    }

    private handleMonitorState(data: SensorDataModel) {
        if (!this.isChanged(data)) {
            this.preValues = data;
            return;
        }
        this.state = MovementState.Movement;
    }

    private handleMovementState(data: SensorDataModel) {
        
    }

    private handleMoveToPositionState(data: SensorDataModel) {
        
    }
}

export class HealthService {

    private healthSensorHandler: HealthSensorHandler;

    constructor(serverConfig: IServerConfig) {
        this.healthSensorHandler = new HealthSensorHandler(serverConfig);
    }

    public run() {
        this.healthSensorHandler.start();
    }



}