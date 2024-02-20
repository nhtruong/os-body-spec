import NamespaceFile from "./NamespaceFile";
import _ from "lodash";
import {OpenAPIV3} from "openapi-types";
import {write2file} from "../helpers";

export default class RootFileBuilder {
    namespacePaths: [string, string[]][]; // [namespace, paths[]]
    format: 'json' | 'yaml';

    constructor(namespaces: Record<string, NamespaceFile>, format: 'json' | 'yaml') {
        this.format = format;
        this.namespacePaths = _.entries(namespaces).map(([name, ns]) => {
            return [name, _.keys(ns.paths)]
        });
    }

    writeToFile(outputDir: string): void {
        const file = `${outputDir}/OpenSearch.openapi`;
        write2file(file, this.#contents(), this.format);
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
                pathsObj[path] = { $ref: `namespaces/${namespace}.${this.format}#/paths/${refPath}` };
            });
        });
        return pathsObj;
    }
}