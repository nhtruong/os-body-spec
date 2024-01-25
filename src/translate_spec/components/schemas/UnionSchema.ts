import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class UnionSchema extends BaseSchema {
    templateFile = 'schema.union.mustache'

    view(): Record<string, any> {
        return {
            types: (this.spec as OpenAPIV3.SchemaObject).oneOf!.map((e) => {
               return BaseSchema.fromObj(e).id();
            }),
        }
    }
}