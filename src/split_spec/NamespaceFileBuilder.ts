import NamespaceFile from "./NamespaceFile";
import {OpenAPIV3} from "openapi-types";
import {extractNamespace, write2file} from "../helpers";
import _ from "lodash";
import {OperationSpec} from "../types";
import fs from 'fs';
import YAML from 'yaml';


const HTTP_VERBS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default class NamespaceFileBuilder {
    namespaces: Record<string, NamespaceFile> = {};
    format: 'json' | 'yaml';

    constructor(format: 'json' | 'yaml') {
        this.format = format;
    }

    #ns(name: string): NamespaceFile {
        if (!this.namespaces[name]) {
            this.namespaces[name] = new NamespaceFile(name, this.format);
        }
        return this.namespaces[name];
    }

    parse(spec: OpenAPIV3.Document): void {
        Object.entries(spec.paths).forEach(([path, pathSpec]) => {
            this.parsePath(path, pathSpec as OpenAPIV3.PathItemObject);
        });

        Object.entries(spec.components!.requestBodies!).forEach(([name, requestBodySpec]) => {
            this.parseRequestBody(name, requestBodySpec as OpenAPIV3.RequestBodyObject);
        });

        Object.entries(spec.components!.responses!).forEach(([name, responseSpec]) => {
            this.parseResponse(name, responseSpec as OpenAPIV3.ResponseObject);
        });

        Object.entries(spec.components!.parameters!).forEach(([name, parameterSpec]) => {
            this.parseParameter(name, parameterSpec as OpenAPIV3.ParameterObject);
        });
    }

    writeToFiles(outputDir: string): void {
        Object.entries(this.namespaces).forEach(([name, ns]) => {
            const folder = `${outputDir}/namespaces`;
            const file = `${folder}/${name}`;
            fs.mkdirSync(folder, {recursive: true});
            write2file(file, ns.contents(), this.format);
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