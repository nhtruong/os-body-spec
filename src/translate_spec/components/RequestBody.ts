import {OpenAPIV3} from "openapi-types";
import {resolve} from "../../helpers";

export default class RequestBody {
    spec: OpenAPIV3.RequestBodyObject;

    type: string;
    description?: string;
    default?: any;
    required: boolean;
    deprecated: boolean;

    bulk: boolean;

    constructor(spec: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject) {
        this.spec = resolve(spec) as OpenAPIV3.RequestBodyObject;
        const schema = resolve((this.spec.content['application/json'].schema || this.spec.content['application/x-ndjson'].schema)) as OpenAPIV3.SchemaObject;
        this.default = schema.default;
        this.required = !!this.spec.required;
        this.deprecated = !!schema.deprecated;
        this.type = this.#parseType(this.spec.content);
        this.description = this.spec.description || schema.description;
        this.bulk = this.type === 'object[]';
    }

    #parseType(content: Record<string, any>): string {
        if (content['application/x-ndjson'] || content['application/json'].schema['x-serialize']! === 'bulk') {
            return 'object[]';
        }
        return content['application/json'].schema.type;
    }
}