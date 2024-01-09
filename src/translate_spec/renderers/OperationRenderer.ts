import Operation from "../components/Operation";
import BaseRenderer from "./BaseRenderer";

export default class OperationRenderer extends BaseRenderer {
    templateFile = 'operation.mustache';
    operation: Operation;
    constructor(operation: Operation) {
        super();
        this.operation = operation;
    }

    view(): Record<string, any> {
        return {
            operation: this.operation,
            parameters: this.operation.parameters,
            body: this.operation.body,
        }
    }
}