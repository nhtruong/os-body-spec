import BaseSchema from "./BaseSchema";

export default class StringSchema extends BaseSchema {
    templateFile = 'schema.basic.mustache'
    basic_type = 'string'

    native_id(): string {
        return 'String';
    }
}