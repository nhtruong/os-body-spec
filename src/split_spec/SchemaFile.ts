import {OpenAPIV3} from "openapi-types";

export default class SchemaFile {
    category: string;
    schemas: { [key: string]: OpenAPIV3.SchemaObject; } = {};

    constructor(category: string) {
        this.category = category;
    }
}