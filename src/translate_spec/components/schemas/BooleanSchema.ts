import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class BooleanSchema extends BaseSchema {
    templateFile = 'schema.basic.mustache'
    basic_type = 'boolean'
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
    }
}