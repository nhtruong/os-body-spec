import SchemaFile from "./SchemaFile";
import {OpenAPIV3} from "openapi-types";
import fs from 'fs';

export default class SchemaFileBuilder {
    schemas: Record<string, SchemaFile> = {};

    #sf(category: string): SchemaFile {
        if (!this.schemas[category]) {
            this.schemas[category] = new SchemaFile(category);
        }
        return this.schemas[category];
    }

    writeToFiles(outputDir: string): void {
        const folder = `${outputDir}/schemas`;
        fs.mkdirSync(folder, {recursive: true});
        Object.entries(this.schemas).forEach(([name, sf]) => {
            const file = `${folder}/${name}.json`;
            fs.writeFileSync(file, JSON.stringify(sf.contents(), null, 2));
        });
    }

    parseSchema(name: string, spec: OpenAPIV3.SchemaObject): void {
        if(!name.includes(':')) return;
        const [category, type] = name.split(':');
        this.#sf(category).schemas[type] = spec;
    }
}