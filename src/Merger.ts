import SwaggerParser from "@apidevtools/swagger-parser";
import {OpenAPIV3} from "openapi-types";
import fs from "fs";

export default class Merger {
    es: OpenAPIV3.Document;
    os: OpenAPIV3.Document;
    os_desc: OpenAPIV3.Document;
    constructor(es_spec: OpenAPIV3.Document, os_spec: OpenAPIV3.Document, os_desc: OpenAPIV3.Document) {
        this.es = es_spec;
        this.os = os_spec;
        this.os_desc = os_desc;
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
        const desc = this.os_desc.paths!;

        for(const path in os) {
            if(es[path] === undefined) continue;
            const methods = os[path];
            for(const method in methods) {
                const m = method as OpenAPIV3.HttpMethods
                if(es[path]![m] === undefined) continue;
                console.log(`\n\n${path} ${method}`);

                const os_op = os[path]![m]!;
                const es_op = es[path]![m]!;

                this.#transfer_requestBody(os_op, es_op, this.#get_description(desc[path]![m]!));
                os_op.responses = es_op.responses
            }
        }
    }

    #transfer_requestBody(os: OpenAPIV3.OperationObject, es: OpenAPIV3.OperationObject, desc: string | undefined): void {
        if(es.requestBody === undefined) return;
        os.requestBody = es.requestBody;
        if(desc === undefined) return;

        const ref = (es.requestBody as OpenAPIV3.ReferenceObject).$ref;
        const requestBody = (ref ? this.#traverse(this.es, ref) : es.requestBody) as OpenAPIV3.RequestBodyObject;
        const schema = requestBody.content!['application/json']!.schema as OpenAPIV3.SchemaObject;
        schema.description = desc;
    }

    #get_description(op: OpenAPIV3.OperationObject): string | undefined {
        const requestBody = op.requestBody as OpenAPIV3.RequestBodyObject;
        const schema = requestBody?.content!['application/json']!.schema as OpenAPIV3.SchemaObject;
        return schema?.description;
    }

    #traverse(obj: Record<string, any>, path: string): Record<string, any> {
        const paths = path.split('/');
        paths.shift();
        for(const p of paths) { obj = obj[p]; }
        return obj;
    }
}