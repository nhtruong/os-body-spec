import BaseRenderer from "./BaseRenderer";
import OperationGroup from "../components/OperationGroup";
import {snake2Camel} from "../../helpers";

export default class QueryParamsRenderer extends BaseRenderer {
    templateFile = 'query_params.mustache';
    group: OperationGroup;

    constructor(group: OperationGroup) {
        super();
        this.group = group;
    }

    view(): Record<string, any> {
        return {
            query_id: this.group.query_id(),
            query_params:this.#queryParams(),
        }
    }

    #queryParams(): Array<Record<string, any>> {
        return this.group.operations[0].queryParams.map((p) => p.view());
    }
}