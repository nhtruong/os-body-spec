import SwaggerParser from "@apidevtools/swagger-parser";
import {OpenAPIV3} from "openapi-types";
import fs from "fs";

export default class Merger {
    es: OpenAPIV3.Document;
    os: OpenAPIV3.Document;
    os_resolved: OpenAPIV3.Document;
    constructor(es_spec: OpenAPIV3.Document, os_spec: OpenAPIV3.Document, os_resolved: OpenAPIV3.Document) {
        this.es = es_spec;
        this.os = os_spec;
        this.os_resolved = os_resolved;
    }
    
    static async init(es_path: string, os_path: string) {
        const es_spec = await SwaggerParser.parse(es_path) as OpenAPIV3.Document;
        const os_spec = await SwaggerParser.parse(os_path) as OpenAPIV3.Document;
        const os_desc = await SwaggerParser.dereference(os_spec) as OpenAPIV3.Document;
        return new Merger(es_spec, os_spec, os_desc);
    }

    merge(output: string): void {
        this.#merge_components();
        this.#merge_bodies();

        fs.writeFileSync(output, JSON.stringify(this.os, null, 2));
    }

    #merge_components(): void {
        const os = this.os.components!;
        const es = this.es.components!;
        os.responses = {...os.responses, ...es.responses};
        os.schemas = {...os.schemas, ...es.schemas};
        os.parameters = {...os.parameters, ...es.parameters};
        os.requestBodies = {...os.requestBodies, ...es.requestBodies};
    }

    #merge_bodies(): void {
        const os = this.os.paths!;
        const es = this.es.paths!;
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

                this.#transfer_requestBody(os_op, es_op, resolved[path]![m]!);
                os_op.responses = es_op.responses
            }
        }
    }

    #transfer_requestBody(os: OpenAPIV3.OperationObject, es: OpenAPIV3.OperationObject, resolved: OpenAPIV3.OperationObject): void {
        if(es.requestBody === undefined) return;
        const resolved_body = resolved.requestBody as OpenAPIV3.RequestBodyObject;
        const resolved_schema = resolved_body?.content!['application/json']!.schema as OpenAPIV3.SchemaObject;

        os.requestBody = es.requestBody;
        if(resolved_schema === undefined) return;

        const es_requestBody = this.#resolve(es.requestBody, this.es) as OpenAPIV3.RequestBodyObject;
        const schema = es_requestBody.content['application/json']!.schema as OpenAPIV3.SchemaObject;
        schema.description = resolved_schema?.description;
        schema['x-serialize' as keyof OpenAPIV3.SchemaObject] = resolved_schema['x-serialize' as keyof OpenAPIV3.SchemaObject];
    }

    #resolve(obj: Record<string, any> | undefined, root: Record<string, any>): Record<string, any> | undefined {
        if(obj === undefined || obj.$ref === undefined) return obj;

        const paths = obj.$ref.split('/');
        paths.shift();
        for(const p of paths) { root = root[p]; }
        return root;
    }
}