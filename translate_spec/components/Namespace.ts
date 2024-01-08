import OperationGroup from "./OperationGroup";

export default class Namespace {
    name: string;
    groups: Array<OperationGroup>;

    constructor(name: string, groups: Array<OperationGroup>) {
        this.name = name;
        this.groups = groups;
    }
}