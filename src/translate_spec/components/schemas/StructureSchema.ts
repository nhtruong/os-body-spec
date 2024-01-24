import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class StructureSchema extends BaseSchema {
    // TODO: AllOf schemas
    // TODO: minProperties, maxProperties
    // TODO: required
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
    }
}