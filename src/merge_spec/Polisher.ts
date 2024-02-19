import fs from "fs";
import {extractNamespace, resolve} from "../helpers";
import _ from "lodash";
import {OpenAPIV3} from "openapi-types";
import {OperationSpec} from "../types";

export default class Polisher {
    doc: Record<string, any>;
    schemaNamespaces: Record<string, string> = {};
    seenRefs: Set<string> = new Set();
    constructor(file: string) {
        this.doc = JSON.parse(fs.readFileSync(file).toString());
        global.spec_root = this.doc;
    }

    polish(output: string): void {
        this.rename_schemas();
        this.rename_schema_refs(this.doc);
        this.deref_bodies(this.doc.paths);
        _.values(this.doc.paths).flatMap(_.values).forEach((op: OperationSpec) => { this.move_bodies(op); });
        this.determineSchemaNamespace(this.doc, undefined);
        fs.writeFileSync(output, JSON.stringify(this.doc, null, 2));
    }

    deref_bodies(obj: Record<string, any>): void {
        const app_json = obj['application/json'];
        if(app_json?.schema?.$ref) {
            const ref = app_json.schema.$ref;
            if(ref.endsWith('ResponseContent') || ref.endsWith('InputPayload') || ref.endsWith('OutputPayload')) {
                app_json.schema = resolve(app_json.schema);
            }
            return;
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.deref_bodies(obj[key]);
        }
    }

    move_bodies(op: OperationSpec): void {
        const requestBody = op.requestBody as OpenAPIV3.RequestBodyObject;
        const requestContent = requestBody?.content;
        if (requestContent) {
            this.doc.components.requestBodies[op['x-operation-group']] = requestBody;
            op.requestBody = {$ref: `#/components/requestBodies/${op['x-operation-group']}`};
        }

        const response = op.responses['200'] as OpenAPIV3.ResponseObject;
        const responseContent = response?.content;
        if (responseContent) {
            this.doc.components.responses[op['x-operation-group'] + '#200'] = response;
            op.responses['200'] = {$ref: `#/components/responses/${op['x-operation-group']}#200`};
        }

    }

    determineSchemaNamespace(obj: Record<string, any>, namespace: string | undefined): void {
        if(obj['x-operation-group']) namespace = extractNamespace(obj['x-operation-group']);
        const ref = obj.$ref;
        if(ref && this.seenRefs.has(ref)) return;
        this.seenRefs.add(ref);

        if(ref?.startsWith('#/components/schemas/') && !ref.includes(':')) {
            const name = ref.split('#/components/schemas/')[1];
            this.schemaNamespaces[name] = namespace!;
        }

        obj = resolve(obj)!;

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.determineSchemaNamespace(obj[key], namespace);
        }
    }

    rename_schema_refs(obj: Record<string, any>): void {
        const ref = obj.$ref;
        if(ref?.startsWith('#/components/schemas/') && ref.includes(':')) {
            const name = ref.split('#/components/schemas/')[1];
            obj.$ref = '#/components/schemas/' + this.newSchemaName(name);
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.rename_schema_refs(obj[key]);
        }
    }

    rename_schemas(): void {
        const schemas = this.doc.components.schemas;
        Object.entries(schemas).forEach(([k, v]) => {
            delete schemas[k];
            schemas[this.newSchemaName(k)] = v;
        });
    }

    newSchemaName(name: string): string {
        const [category, type] = name.split(':');
        const parts = category.split('.');
        if(['_types', '_spec_utils'].includes(category)) return `_common:${type}`;
        if(parts[0] === '_global') return `_core.${parts[1]}:${type}`;
        if(parts[0] === '_types') return `_common.${parts[1]}:${type}`;
        if(parts[1] === '_types') return `${parts[0]}._common:${type}`;
        return name;
    }
}