import {OpenAPIV3} from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import NamespaceFileBuilder from "./NamespaceFileBuilder";
import SchemaFileBuilder from "./SchemaFileBuilder";
import fs from 'fs';

export default class SpecSplitter {

    /**
     * Initialize the splitter. Use this instead of the constructor directly.
     * @param spec path to the spec file
     */
    static async init(spec: string) {
        return new SpecSplitter(await SwaggerParser.parse(spec) as OpenAPIV3.Document);
    }

    constructor(spec: OpenAPIV3.Document) {
        global.spec_root = spec;
    }

    split(outputDir: string): void {
        if (fs.existsSync(outputDir)) { fs.rmSync(outputDir, {recursive: true}); }

        const ns = new NamespaceFileBuilder();
        Object.entries(global.spec_root.paths).forEach(([path, spec]) => {
            ns.parsePath(path, spec as OpenAPIV3.PathItemObject);
        });
        Object.entries(global.spec_root.components.requestBodies).forEach(([name, spec]) => {
            ns.parseRequestBody(name, spec as OpenAPIV3.RequestBodyObject);
        });
        Object.entries(global.spec_root.components.responses).forEach(([name, spec]) => {
            ns.parseResponse(name, spec as OpenAPIV3.ResponseObject);
        });
        Object.entries(global.spec_root.components.parameters).forEach(([name, spec]) => {
            ns.parseParameter(name, spec as OpenAPIV3.ParameterObject);
        });
        ns.writeToFiles(outputDir);

        const sk = new SchemaFileBuilder();
        Object.entries(global.spec_root.components.schemas).forEach(([name, spec]) => {
            sk.parseSchema(name, spec as OpenAPIV3.SchemaObject);
        });
        sk.writeToFiles(outputDir);
    }
}