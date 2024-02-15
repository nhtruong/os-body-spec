import NamespaceFile from "./NamespaceFile";
import {OpenAPIV3} from "openapi-types";
import {extractNamespace} from "../helpers";
import _ from "lodash";
import {OperationSpec} from "../types";
import fs from 'fs';


const HTTP_VERBS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default class NamespaceFileBuilder {
    namespaces: Record<string, NamespaceFile> = {};

    #ns(name: string): NamespaceFile {
        if (!this.namespaces[name]) {
            this.namespaces[name] = new NamespaceFile(name);
        }
        return this.namespaces[name];
    }

    writeToFiles(outputDir: string): void {
        Object.entries(this.namespaces).forEach(([name, ns]) => {
            const folder = `${outputDir}/namespaces`;
            const file = `${folder}/${name}.json`;
            fs.mkdirSync(folder, {recursive: true});
            fs.writeFileSync(file, JSON.stringify(ns.contents(), null, 2));
        });
    }

    parsePath(path: string, spec: OpenAPIV3.PathItemObject): void {
        const operation = Object.values(_.pick(spec, HTTP_VERBS))[0] as OperationSpec;
        const namespace = extractNamespace(operation['x-operation-group']);
        this.#ns(namespace).paths[path] = spec;
    }

    parseRequestBody(name: string, spec: OpenAPIV3.RequestBodyObject): void {
        const namespace = extractNamespace(name);
        this.#ns(namespace).requestBodies[name] = spec;
    }

    parseResponse(name: string, spec: OpenAPIV3.ResponseObject): void {
        const namespace = extractNamespace(name.split('#')[0]);
        this.#ns(namespace).responses[name] = spec;
    }

    parseParameter(name: string, spec: OpenAPIV3.ParameterObject): void {
        const namespace = extractNamespace(name.split('#')[0]);
        this.#ns(namespace).parameters[name] = spec;
    }
}