import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class ListSchema extends BaseSchema {
    templateFile = 'schema.list.mustache'

    view(): Record<string, any> {
        const { items } = this.spec as OpenAPIV3.ArraySchemaObject;
        return {
            member_id: BaseSchema.fromObj(items).id,
        }
    }
}