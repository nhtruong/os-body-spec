import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class ListSchema extends BaseSchema {
    //TODO: unnamed lists
    templateFile = 'schema.list.mustache'

    member: BaseSchema;

    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
        this.member = BaseSchema.fromObj((spec as OpenAPIV3.ArraySchemaObject).items!);
    }

    view(): Record<string, any> {
        return {
            member_id: this.member.id(),
        }
    }

    native_id(): string {
        return this.member.id() + '_List';
    }
}