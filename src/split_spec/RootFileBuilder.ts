import NamespaceFile from "./NamespaceFile";
import _ from "lodash";
import fs from 'fs';
import {OpenAPIV3} from "openapi-types";

export default class RootFileBuilder {
    namespacePaths: [string, string[]][]; // [namespace, paths[]]

    constructor(namespaces: Record<string, NamespaceFile>) {
        this.namespacePaths = _.entries(namespaces).map(([name, ns]) => {
            return [name, _.keys(ns.paths)]
        });
    }

    writeToFile(outputDir: string): void {
        const file = `${outputDir}/OpenSearch.openapi.json`;
        fs.writeFileSync(file, JSON.stringify(this.#contents(), null, 2));
    }

    #contents(): Record<string, any> {
        return {
            openapi: '3.1.0',
            info: {
                title: 'OpenSearch API',
                description: 'OpenSearch API',
                version: '1.0.0'
            },
            paths: this.#paths()
        };
    }

    #paths(): Record<string, OpenAPIV3.ReferenceObject> {
        const pathsObj: Record<string, OpenAPIV3.ReferenceObject> = {};
        this.namespacePaths.forEach(([namespace, paths]) => {
            paths.forEach(path => {
                const refPath = path.replaceAll('~', '~0').replaceAll('/', '~1');
                pathsObj[path] = { $ref: `namespaces/${namespace}.json#/paths/${refPath}` };
            });
        });
        return pathsObj;
    }
}