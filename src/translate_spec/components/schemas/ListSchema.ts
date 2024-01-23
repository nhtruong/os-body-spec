import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class ListSchema extends BaseSchema {
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
    }
}