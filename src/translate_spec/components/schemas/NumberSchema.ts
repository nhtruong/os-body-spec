import BaseSchema from "./BaseSchema";

export default class NumberSchema extends BaseSchema {
    templateFile = 'schema.basic.mustache'
    basic_type = 'integer'

    native_id(): string {
        if(this.spec.format === 'int64') return 'Long';
        return 'Integer';
    }
}