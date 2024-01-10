import {ParameterSpec} from "./types";
import {resolve} from "../../helpers";
import {OpenAPIV3} from "openapi-types";

export default class Parameter {
    spec: ParameterSpec;
    schema: OpenAPIV3.SchemaObject;

    name: string;
    type: string;
    description?: string;
    default?: any;
    required: boolean;
    deprecated: boolean;

    constructor(spec: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject) {
        this.spec = resolve(spec) as ParameterSpec;
        this.schema = resolve(this.spec.schema) as OpenAPIV3.SchemaObject;
        this.name = this.spec.name;
        this.type = this.schema?.type || this.spec['x-data-type'] || 'UNKNOWN';
        this.description = this.spec.description;
        this.required = this.spec.required || false;
        this.deprecated = this.spec.deprecated || false;
        this.default = this.schema?.default;
    }
}