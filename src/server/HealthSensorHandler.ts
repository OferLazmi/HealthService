import { IServerConfig } from "../configuration/configurationManager";
import { MovementState } from "./MovementState";
import { SensorDataModel } from "./SensorDataModel";
import { UsbProvider } from "./UsbProvider";


export class HealthSensorHandler {

    private usbProvider: UsbProvider;
    private mainPosition: SensorDataModel = null;
    private lastPosition: SensorDataModel = null;
    private state: MovementState = MovementState.Idle;
    private MaxNotMovingDuration: number = 10; // Monitor => Movementneed
    private MinTimeForPositionReset: number = 5; // MovementNeeded => Monitor
    private MaxChangedRatioAllowed: number = 0.3; // if more than MaxChangedRatioAllowed are changed (pressure changed) => we can move from Movementneed => Movement
    private MinSensingRatio: number = 0.1; // if more than MinSensingRatio are not 0 (pressure exist) => we move out from idle to monitoring

    private poseStartTime: number = -1;
    private movementStartTime: number = -1;
    private testnow: number = -1;

    constructor(private serverConfig: IServerConfig) {
        this.usbProvider = new UsbProvider();
    }

    public secInMainPose(): number // valid if we are not in idle
    {
        if (this.state === MovementState.Idle) {
            return -1;
        }
        return (this.now() - this.poseStartTime) / 1000.0;
    }

    // API to client
    public getSnapshot(): [SensorDataModel, SensorDataModel, MovementState, number, number] {
        return [this.mainPosition, this.lastPosition, this.state, this.secInMainPose(), this.secInMovement()];
    }

    private toString(s: SensorDataModel): string {
        if (s === null) {
            return "null";
        }
        return s.toString();
    }

    public getSnapshotString(): [number, string, string, number, number, number] {
        return [this.now() / 1000, this.toString(this.mainPosition), this.toString(this.lastPosition), this.state, this.secInMainPose(), this.secInMovement()];
    }


    public test() {


        let noSensing = new SensorDataModel([
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]);

        let noSensing2 = new SensorDataModel([
            [1, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]);

        let pose11 = new SensorDataModel([
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ]);

        let pose12 = new SensorDataModel([
            [0, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ]);

        let pose21 = new SensorDataModel([
            [0, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ]);

        let pose22 = new SensorDataModel([
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ]);
        // private MaxNotMovingDuration: number = 10;
        // private MinTimeForPositionReset: number = 5; //todo
        // private MaxChangedRatioAllowed: number = 0.3;//todo conf
        // private MinSensingRatio: number = 0.1;//todo conf
        //
        this.onSensorDataArrive(noSensing, 1);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(noSensing2, 2);
        console.log(this.getSnapshotString());

        //
        this.onSensorDataArrive(pose11, 3);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose12, 4);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose12, 7);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose12, 18);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose11, 19);
        console.log(this.getSnapshotString());

        // movement needed
        this.onSensorDataArrive(pose21, 21);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose21, 22);
        console.log(this.getSnapshotString());
        //    Idle,
        //     Monitor,
        //     MovementNeeded,
        //     Movement
        //
        this.onSensorDataArrive(pose12, 23);
        console.log(this.getSnapshotString());

        //
        this.onSensorDataArrive(pose21, 24);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose22, 25);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose21, 26);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose22, 27);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose21, 28);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose22, 29);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose21, 30);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose22, 35);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(pose22, 36);
        console.log(this.getSnapshotString());

        this.onSensorDataArrive(noSensing, 37);
        console.log(this.getSnapshotString());


    }

    public start() {
        this.usbProvider.connect(this.serverConfig.sensorConfig);
        this.usbProvider.listenForData(this.onSensorDataArrive.bind(this));
    }

    private onSensorDataArrive(data: SensorDataModel, testnow: number = -1) {
        this.testnow = testnow * 1000;
        this.handleState(data);
    }

    private sensingDetected(data: SensorDataModel): boolean {

        let changeCount = 0;
        for (let x = 0; x < data.values.length; x++) {
            const item = data.values[x];
            for (let y = 0; y < item.length; y++) {
                if (item[y] > 0) {
                    changeCount++;
                }
            }
        }

        const threshold = changeCount / (data.values.length * data.values[0].length);
        return threshold > this.MinSensingRatio;
    }
    private inMainPose(data: SensorDataModel): boolean {
        console.assert(this.mainPosition != null);

        let changeCount = 0;
        for (let x = 0; x < data.values.length; x++) {
            const item = data.values[x];
            for (let y = 0; y < item.length; y++) {
                if (item[y] !== this.mainPosition.values[x][y]) {
                    changeCount++;
                }
            }
        }

        const threshold = changeCount / (data.values.length * data.values[0].length);
        return threshold < this.MaxChangedRatioAllowed;
    }

    private handleState(data: SensorDataModel) {

        this.lastPosition = data;

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
            case MovementState.MovementNeeded: {
                this.handleMovementNeeded(data);
                break;
            }
        }
    }

    public now() {
        if (this.testnow !== -1) {
            return this.testnow;
        }
        return new Date().getTime();
    }

    private reset() {
        this.movementStartTime = -1;
        this.poseStartTime = -1;
        this.mainPosition = null;
    }

    private handleIdleState(data: SensorDataModel) {
        if (!this.sensingDetected(data)) {
            return;
        }

        this.mainPosition = data;
        this.poseStartTime = this.now();
        this.state = MovementState.Monitor;
    }

    private handleMonitorState(data: SensorDataModel) {
        if (!this.sensingDetected(data)) {
            this.state = MovementState.Idle;
            this.reset();
            return;
        }

        if (this.inMainPose(data)) {
            if (this.tooLongInMainPose()) {
                this.state = MovementState.MovementNeeded;
                return;
            }
            return;
        }

        // pose changed
        this.mainPosition = data;
        this.poseStartTime = this.now();
    }

    private handleMovementState(data: SensorDataModel) {
        if (!this.sensingDetected(data)) {
            this.state = MovementState.Idle;
            this.reset();
            return;
        }

        if (this.enoughTimeInMovement()) {
            this.movementStartTime = -1;
            this.poseStartTime = this.now();
            this.state = MovementState.Monitor;
            this.mainPosition = data;
            return;
        }

        if (this.inMainPose(data)) {
            this.movementStartTime = -1;
            this.state = MovementState.MovementNeeded;
            return;
        }
    }

    private handleMovementNeeded(data: SensorDataModel) {
        if (!this.sensingDetected(data)) {
            this.state = MovementState.Idle;
            this.reset();
            return;
        }

        if (this.inMainPose(data)) {
            return;
        }

        this.movementStartTime = this.now();
        this.state = MovementState.Movement;
    }

    private tooLongInMainPose(): boolean {
        console.assert(this.state !== MovementState.Idle);
        return this.secInMainPose() > this.MaxNotMovingDuration;
    }

    private enoughTimeInMovement(): boolean {
        return this.secInMovement() > this.MinTimeForPositionReset;
    }

    private secInMovement() {
        if (this.state !== MovementState.Movement) {
            return -1;
        }
        return (this.now() - this.movementStartTime) / 1000.0;
    }
}
