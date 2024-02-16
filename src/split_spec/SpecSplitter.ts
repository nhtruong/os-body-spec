import {OpenAPIV3} from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import NamespaceFileBuilder from "./NamespaceFileBuilder";
import SchemaFileBuilder from "./SchemaFileBuilder";
import fs from 'fs';
import RootFileBuilder from "./RootFileBuilder";

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
        ns.parse(global.spec_root as OpenAPIV3.Document);
        ns.writeToFiles(outputDir);

        const sk = new SchemaFileBuilder();
        sk.parse(global.spec_root as OpenAPIV3.Document);
        sk.writeToFiles(outputDir);

        const rt = new RootFileBuilder(ns.namespaces)
        rt.writeToFile(outputDir);
    }
}