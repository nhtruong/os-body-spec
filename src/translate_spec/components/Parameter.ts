import {ParameterSpec} from "./types";
import {trait_value, hyphen2Camel, resolve} from "../../helpers";
import {OpenAPIV3} from "openapi-types";
import Schema from "./Schema";

export default class Parameter {
    spec: ParameterSpec;
    schema: Schema;

    name: string;
    description?: string;
    default?: any;
    required: boolean;
    deprecated: boolean;

    constructor(spec: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject) {
        this.spec = resolve(spec) as ParameterSpec;
        this.schema = Schema.fromObj(this.spec.schema);
        this.name = this.spec.name;
        this.description = this.spec.description;
        this.required = this.spec.required || false;
        this.deprecated = this.spec.deprecated || false;
        this.default = this.schema.default;
    }

    view(): Record<string, any> {
        return {
            name: this.name,
            id: this.schema.id,
            required: this.required,
            description: this.description,
            default: trait_value(this.default),
            deprecated: this.deprecated,
            extensions: this.#extensions(),
        }
    }

    #extensions(): Record<string, any> {
        return Object.keys(this.spec).filter((k) => k.startsWith('x-')).map((k) => {
            return {
                name: hyphen2Camel(k, false),
                value: trait_value(this.spec[k as keyof ParameterSpec]),
            }
        })
    }
}