import Operation from "./Operation";

// API Method
export default class OperationGroup {
    group: string;
    operations: Array<Operation>;

    name: string;
    namespace: string;

    constructor(group: string, operations: Array<Operation>) {
        this.group = group;
        this.operations = this.#sortOperations(operations);
        if(operations.length > 1) this.operations.forEach((op, i) => { op.order = i });
        [this.name, this.namespace] = group.split('.').reverse();
    }

    #sortOperations(operations: Operation[]): Array<Operation> {
        return operations.sort((a, b) => {
            if(!a.ignored && b.ignored) return -1;
            if(a.ignored && !b.ignored) return 1;

            if(!a.deprecated && b.deprecated) return -1;
            if(a.deprecated && !b.deprecated) return 1;

            if(a.path.length < b.path.length) return -1;
            if(a.path.length > b.path.length) return 1;

            return a.verb.localeCompare(b.verb);
        });
    }
}