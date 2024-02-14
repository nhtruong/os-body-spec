import {OpenAPIV3} from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import Path from "./Path";

export default class SpecSplitter {
    paths: Record<string, OpenAPIV3.PathsObject>;
    requestBodies: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject>;

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
        Object.entries(global.spec_root.paths as OpenAPIV3.PathsObject).forEach(([path, spec]) => {
            const p = new Path(path, spec as OpenAPIV3.PathItemObject);
            console.log(p.path, p.namespace)
        });
    }


}