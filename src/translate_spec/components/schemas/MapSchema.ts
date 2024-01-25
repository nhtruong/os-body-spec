import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class MapSchema extends BaseSchema {
    templateFile = 'schema.map.mustache'
    value: BaseSchema;
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
        this.value = BaseSchema.fromObj(spec.additionalProperties! as OpenAPIV3.SchemaObject);
    }

    view(): Record<string, any> {
        return {
            value_id: this.value.id(),
        }
    }

    native_id(): string {
        return this.value.id() + '_Map';
    }
}