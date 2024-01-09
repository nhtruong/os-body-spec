import Operation from "../components/Operation";
import BaseRenderer from "./BaseRenderer";
import {disp_value, snake2Camel} from "../../helpers";

export default class OperationRenderer extends BaseRenderer {
    templateFile = 'operation.mustache';
    operation: Operation;

    constructor(operation: Operation) {
        super();
        this.operation = operation;
    }

    view(): Record<string, any> {
        return {
            id: this.operation.id(),
            input_id: this.operation.inputId(),
            output_id: this.operation.outputId(),
            documentation: this.operation.spec.description,
            method: this.operation.verb,
            uri: this.operation.path,
            extensions: this.#extensions(),
            readonly: this.operation.verb === 'get',
            idempotent: this.operation.verb === 'put'
        }
    }

    #extensions(): Array<Record<string, any>> {
        const keys = Object.keys(this.operation.spec)
                           .filter((k) => k.startsWith('x-'))
                           .filter((k) => k !== 'x-operation-group').sort();
        return keys.map((k) => {
            return {
                name: snake2Camel(k.replaceAll('-', '_'), false),
                value: disp_value(this.operation.spec[k as keyof Operation['spec']])
            }
        });
    }
}