import BaseRenderer from "./BaseRenderer";
import OperationGroup from "../components/OperationGroup";
import Operation from "../components/Operation";
import {disp_value, snake2Camel} from "../../helpers";

export default class OperationsRenderer extends BaseRenderer {
    templateFile = 'operations.mustache';
    private group: OperationGroup;

    constructor(group: OperationGroup) {
        super();
        this.group = group;
    }

    view(): Record<string, any> {
        return {
            api_reference: this.group.operations.map((op) => op.api_ref).find((ref) => ref !== undefined),
            documentation: this.group.operations.map((op) => op.spec.description).find((desc) => desc !== undefined),
            operations: this.#operations(),
        }
    }

    #operations(): Array<Record<string, any>> {
        return this.group.operations.map((op) => {
            return {
                id: op.id(),
                input_id: op.inputId(),
                output_id: op.outputId(),
                deprecated: op.deprecated,
                method: op.verb.toUpperCase(),
                uri: op.path,
                readonly: op.verb === 'get',
                idempotent: op.verb === 'put',
                extensions: this.#extensions(op),
            }
        });
    }

    #extensions(op: Operation): Array<Record<string, any>> {
        const keys = Object.keys(op.spec)
                           .filter((k) => k.startsWith('x-'))
                           .filter((k) => k !== 'x-operation-group').sort();
        return keys.map((k) => {
            return {
                name: snake2Camel(k.replaceAll('-', '_'), false),
                value: disp_value(op.spec[k as keyof Operation['spec']])
            }
        });
    }
}