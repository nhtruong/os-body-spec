import BaseSchema from "./BaseSchema";

export default class BooleanSchema extends BaseSchema {
    templateFile = 'schema.basic.mustache'
    basic_type = 'boolean'
}