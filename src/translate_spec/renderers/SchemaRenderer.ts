import BaseRenderer from "./BaseRenderer";
import BaseSchema from "../components/schemas/BaseSchema";

export default class SchemaRenderer extends BaseRenderer {
    templateFile: string;
    schema: BaseSchema;
    constructor(schema: BaseSchema) {
        super();
        this.schema = schema;
        this.templateFile = schema.templateFile;
    }

    view(): Record<string, any> {
        return { ...this.schema.common() , ...this.schema.view()};
    }
}