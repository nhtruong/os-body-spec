import Operation from "./Operation";

// API Method
export default class OperationGroup {
    group: string;
    operations: Array<Operation>;

    name: string;
    namespace: string;

    constructor(group: string, operations: Array<Operation>) {
        this.group = group;
        this.operations = operations;
        [this.name, this.namespace] = group.split('.').reverse();
    }
}