import BaseSchema from "./BaseSchema";

export default class IntegerSchema extends BaseSchema {
    templateFile = 'schema.basic.mustache'
    basic_type = 'integer'

    native_id(): string {
        return 'Integer';
    }
}