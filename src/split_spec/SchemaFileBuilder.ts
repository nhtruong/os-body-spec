import SchemaFile from "./SchemaFile";
import {OpenAPIV3} from "openapi-types";
import fs from 'fs';
import {write2file} from "../helpers";

export default class SchemaFileBuilder {
    schemas: Record<string, SchemaFile> = {};
    format: 'json' | 'yaml';

    constructor(format: 'json' | 'yaml') {
        this.format = format;
    }

    #sf(category: string): SchemaFile {
        if (!this.schemas[category]) {
            this.schemas[category] = new SchemaFile(category, this.format);
        }
        return this.schemas[category];
    }

    parse(spec: OpenAPIV3.Document): void {
        Object.entries(spec.components!.schemas!).forEach(([name, spec]) => {
            this.parseSchema(name, spec as OpenAPIV3.SchemaObject);
        });
    }

    writeToFiles(outputDir: string,): void {
        const folder = `${outputDir}/schemas`;
        fs.mkdirSync(folder, {recursive: true});
        Object.entries(this.schemas).forEach(([name, sf]) => {
            const file =  `${folder}/${name}`;
            write2file(file, sf.contents(), this.format);
        });
    }

    parseSchema(name: string, spec: OpenAPIV3.SchemaObject): void {
        if(!name.includes(':')) return;
        const [category, type] = name.split(':');
        this.#sf(category).schemas[type] = spec;
    }
}