import Operation from "./Operation";
import {snake2Camel} from "../../helpers";
import ParameterSchema from "./schemas/ParameterSchema";

// API Method
export default class OperationGroup {
    group: string;
    operations: Array<Operation>;

    _id: string; // Used to build smithy IDs for its components
    name: string;
    namespace: string;

    constructor(group: string, operations: Array<Operation>) {
        this.group = group;
        this.operations = this.#sortOperations(operations);
        if(operations.length > 1) this.operations.forEach((op, i) => { op.order = i });
        [this.name, this.namespace] = group.split('.').reverse();

        this._id = this.name.split('.').map((s) => snake2Camel(s)).join('_')
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

    #uniquePathSchemas(): Array<ParameterSchema> {
        const names = new Set<string>();
        return this.operations.flatMap((op) => op.pathParams).filter((p) => {
            if(names.has(p.name)) return false;
            names.add(p.name);
            return true;
        }).map((p) => p.schema);
    }
    crawl_schemas() {
        // Crawl path parameters
        console.log(this.#uniquePathSchemas().map((p) => p.id()));
        // TODO: Crawl shared query parameters
        // TODO: Crawl shared request body
        // TODO: Crawl shared response body
    }

    query_id(): string {
        return `OP_${this._id}_QUERY_PARAMS`;
    }

    output_id(): string {
        return `OP_${this._id}_OUTPUT`;
    }

    requestBody_id(): string {
        return `OP_${this._id}_REQUEST_BODY`;
    }
}