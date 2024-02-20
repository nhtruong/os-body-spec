import {OpenAPIV3} from "openapi-types";

export default class SchemaFile {
    category: string;
    schemas: { [key: string]: OpenAPIV3.SchemaObject; } = {};
    format: 'json' | 'yaml';

    constructor(category: string, format: 'json' | 'yaml') {
        this.category = category;
        this.format = format;
    }

    contents(): Record<string, any> {
        this.#move_refs(this.schemas);

        return {
            openapi: '3.1.0',
            info: {
                title: `Schemas of ${this.category} category`,
                description: `Schemas of ${this.category} category`,
                version: '1.0.0'
            },
            paths: {},
            components: {
                schemas: this.schemas
            },
        };
    }

    #move_refs(obj: Record<string, any>): void {
        const ref = obj.$ref;
        if(ref?.startsWith('#/components/schemas/')) {
            const name = ref.split('#/components/schemas/')[1];
            const [category, type] = name.split(':');

            if(category !== this.category) { obj.$ref = `${category}.${this.format}#/components/schemas/${type}`; }
            else { obj.$ref = `#/components/schemas/${type}`; }
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.#move_refs(obj[key]);
        }
    }
}