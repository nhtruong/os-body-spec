import SwaggerParser from "@apidevtools/swagger-parser";
import {OpenAPIV3} from "openapi-types";
import fs from "fs";
import { resolve } from "../helpers";
import OperationParameters from "./OperationParameters";

declare global {
    var es_root: OpenAPIV3.Document
    var os_root: OpenAPIV3.Document
}

export default class Merger {
    constructor(es_spec: OpenAPIV3.Document, os_spec: OpenAPIV3.Document) {
        global.es_root = es_spec;
        global.os_root = os_spec;
    }
    
    static async init(es_path: string, os_path: string) {
        const es_spec = await SwaggerParser.parse(es_path) as OpenAPIV3.Document;
        const os_spec = await SwaggerParser.parse(os_path) as OpenAPIV3.Document;
        return new Merger(es_spec, os_spec);
    }

    merge(output: string): void {
        this.#transfer_components();
        this.#transfer_operations();

        fs.writeFileSync(output, JSON.stringify(global.os_root, null, 2));
    }

    #transfer_components(): void {
        const os = global.os_root.components!;
        const es = global.es_root.components!;
        os.responses = {...os.responses, ...es.responses};
        os.schemas = {...os.schemas, ...es.schemas};
        os.parameters = {...os.parameters, ...es.parameters};
        os.requestBodies = {...os.requestBodies, ...es.requestBodies};
    }

    #transfer_operations(): void {
        const os = global.os_root.paths!;
        const es = global.es_root.paths!;

        for(const path in os) {
            if(es[path] === undefined) continue;
            const methods = os[path];
            for(const method in methods) {
                const m = method as OpenAPIV3.HttpMethods
                if(es[path]![m] === undefined) continue;

                const os_op = os[path]![m]!;
                const es_op = es[path]![m]!;

                this.#transfer_parameters(os_op, es_op);
                this.#transfer_requestBody(os_op, es_op);
                os_op.responses = es_op.responses // transfer responses
            }
        }
    }

    #transfer_parameters(os: OpenAPIV3.OperationObject, es: OpenAPIV3.OperationObject): void {
        const os_params = new OperationParameters(os.parameters, os_root);
        const es_params = new OperationParameters(es.parameters, es_root);
        os.parameters = OperationParameters.merge(os_params, es_params);
    }

    #transfer_requestBody(os: OpenAPIV3.OperationObject, es: OpenAPIV3.OperationObject): void {
        if(es.requestBody === undefined) return;
        const resolved_body = resolve(os.requestBody, os_root) as OpenAPIV3.RequestBodyObject;
        const resolved_schema = resolve(resolved_body?.content!['application/json']!.schema, os_root) as OpenAPIV3.SchemaObject;

        os.requestBody = es.requestBody;
        if(resolved_schema === undefined) return;

        const es_requestBody = resolve(es.requestBody, global.es_root) as OpenAPIV3.RequestBodyObject;
        const schema = resolve(es_requestBody.content['application/json']!.schema, es_root)!;
        schema.description = resolved_schema?.description;
        schema['x-serialize' as keyof OpenAPIV3.SchemaObject] = resolved_schema['x-serialize' as keyof OpenAPIV3.SchemaObject];
    }
}