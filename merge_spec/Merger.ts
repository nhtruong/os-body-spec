import SwaggerParser from "@apidevtools/swagger-parser";
import {OpenAPIV3} from "openapi-types";
import fs from "fs";
import { resolve } from "./helpers";
import OperationParameters from "./OperationParameters";

declare global {
    var es_root: OpenAPIV3.Document
    var os_root: OpenAPIV3.Document
}

export default class Merger {
    os_resolved: OpenAPIV3.Document;
    constructor(es_spec: OpenAPIV3.Document, os_spec: OpenAPIV3.Document, os_resolved: OpenAPIV3.Document) {
        global.es_root = es_spec;
        global.os_root = os_spec;
        this.os_resolved = os_resolved;
    }
    
    static async init(es_path: string, os_path: string) {
        const es_spec = await SwaggerParser.parse(es_path) as OpenAPIV3.Document;
        const os_spec = await SwaggerParser.parse(os_path) as OpenAPIV3.Document;
        const os_desc = await SwaggerParser.dereference(os_spec) as OpenAPIV3.Document;
        return new Merger(es_spec, os_spec, os_desc);
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
        const resolved = this.os_resolved.paths!;

        for(const path in os) {
            if(es[path] === undefined) continue;
            const methods = os[path];
            for(const method in methods) {
                const m = method as OpenAPIV3.HttpMethods
                if(es[path]![m] === undefined) continue;
                console.log(`\n\n${path} ${method}`);

                const os_op = os[path]![m]!;
                const es_op = es[path]![m]!;

                this.#transfer_parameters(os_op, es_op);
                this.#transfer_requestBody(os_op, es_op, resolved[path]![m]!);
                os_op.responses = es_op.responses // transfer responses
            }
        }
    }

    #transfer_parameters(os: OpenAPIV3.OperationObject, es: OpenAPIV3.OperationObject): void {
        const os_params = new OperationParameters(os.parameters, global.os_root);
        const es_params = new OperationParameters(es.parameters, global.es_root);
        os.parameters = OperationParameters.merge(os_params, es_params);
    }

    #transfer_requestBody(os: OpenAPIV3.OperationObject, es: OpenAPIV3.OperationObject, resolved: OpenAPIV3.OperationObject): void {
        if(es.requestBody === undefined) return;
        const resolved_body = resolved.requestBody as OpenAPIV3.RequestBodyObject;
        const resolved_schema = resolved_body?.content!['application/json']!.schema as OpenAPIV3.SchemaObject;

        os.requestBody = es.requestBody;
        if(resolved_schema === undefined) return;

        const es_requestBody = resolve(es.requestBody, global.es_root) as OpenAPIV3.RequestBodyObject;
        const schema = es_requestBody.content['application/json']!.schema as OpenAPIV3.SchemaObject;
        schema.description = resolved_schema?.description;
        schema['x-serialize' as keyof OpenAPIV3.SchemaObject] = resolved_schema['x-serialize' as keyof OpenAPIV3.SchemaObject];
    }
}