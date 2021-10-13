

export class SensorDataModel {
    public values = [];

    public constructor(values: number[][]) {
        this.values = values;
    }
    public toString() {
        let res = "";
        for (let x = 0; x < this.values.length; x++) {
            const item = this.values[x];
            let a: string = "[";
            for (let y = 0; y < item.length; y++) {
                a = a + "," + item[y];
            }
            a = a + "]";
            res = res + a + "-";
        }
        return res;
    }
}
