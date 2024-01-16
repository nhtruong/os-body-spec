import {ParameterSpec} from "./types";
import {resolve} from "../../helpers";
import {OpenAPIV3} from "openapi-types";
import Schema from "./Schema";

export default class Parameter {
    spec: ParameterSpec;
    schema: Schema;

    name: string;
    type: string;
    description?: string;
    default?: any;
    required: boolean;
    deprecated: boolean;

    constructor(spec: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject) {
        this.spec = resolve(spec) as ParameterSpec;
        this.schema = Schema.fromObj(this.spec.schema);
        this.name = this.spec.name;
        this.type = this.schema.type || this.spec['x-data-type'] || 'UNKNOWN';
        this.description = this.spec.description;
        this.required = this.spec.required || false;
        this.deprecated = this.spec.deprecated || false;
        this.default = this.schema.default;
    }
}