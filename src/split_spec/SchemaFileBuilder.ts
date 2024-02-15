import SchemaFile from "./SchemaFile";
import {OpenAPIV3} from "openapi-types";

export default class SchemaFileBuilder {
    schemas: Record<string, SchemaFile> = {};

    #sf(category: string): SchemaFile {
        if (!this.schemas[category]) {
            this.schemas[category] = new SchemaFile(category);
        }
        return this.schemas[category];
    }

    parseSchema(name: string, spec: OpenAPIV3.SchemaObject): void {
        const [category, type] = name.split(':');
        this.#sf(category).schemas[type] = spec;
    }
}