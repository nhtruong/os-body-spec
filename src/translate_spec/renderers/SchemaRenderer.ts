import BaseRenderer from "./BaseRenderer";
import Schema from "../components/Schema";

export default class SchemaRenderer extends BaseRenderer {
    templateFile = 'schema.mustache';

    schema: Schema;
    constructor(schema: Schema) {
        super();
        this.schema = schema;
    }

    view(): Record<string, any> {
        return { ...this._unique_fields(),
            id: this.schema.id,
            type: this.schema.type,
        };
    }

    _unique_fields(): Record<string, any> {
        if (['string', 'number', 'boolean', 'integer'].includes(this.schema.type)) { return {} }

        throw `Unsupported schema type: ${this.schema.type}`;
    }
}