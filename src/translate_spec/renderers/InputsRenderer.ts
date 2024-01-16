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
            query_id: this.group.query_id(),
            inputs: this.#inputs(),
        }
    }

    #inputs(): Array<Record<string, any>> {
        return this.group.operations.map((op) => {
            return {
                id: op.inputId(),
                params: op.pathParams.map((p) => p.view()),
                body: op.requestBody ? {
                    id: this.group.requestBody_id(),
                    required: op.requestBody.required,
                } : undefined,
            }
        });
    }
}