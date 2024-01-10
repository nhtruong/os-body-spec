import BaseRenderer from "./BaseRenderer";
import OperationGroup from "../components/OperationGroup";
import {snake2Camel} from "../../helpers";

export default class InputsRenderer extends BaseRenderer {
    templateFile = 'inputs.mustache';
    group: OperationGroup;

    constructor(group: OperationGroup) {
        super();
        this.group = group;
    }

    view(): Record<string, any> {
        return {
            query_id: this.#queryId(),
            query_params:this.#queryParams(),
            inputs: this.#inputs(),
        }
    }

    #queryId(): string {
        const main = this.group.name.split('.').map((s) => snake2Camel(s)).join('_')
        return `OP_${main}_QUERY_PARAMS`;
    }

    #queryParams(): Array<Record<string, any>> {
        return this.group.operations[0].queryParams.map((p) => {
            return {
                name: p.name,
                type: p.type,
                required: p.required,
                description: p.description,
            }
        });
    }

    #inputs(): Array<Record<string, any>> {
        return this.group.operations.map((op) => {
            return {
                id: op.inputId(),
            }
        });
    }
}