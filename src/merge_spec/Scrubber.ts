import fs from 'fs';
import {extractNamespace, resolve} from '../helpers';
import _ from "lodash";
import {OperationSpec} from "../types";
import {OpenAPIV3} from "openapi-types";

export default class Scrubber {
    doc: Record<string, any>;

    schemaNamespaces: Record<string, string> = {};
    usedRefs: Record<string, Set<string>>;
    seenRefs: Set<string> = new Set();

    constructor(file: string) {
        this.doc = JSON.parse(fs.readFileSync(file).toString());
        global.spec_root = this.doc;
        this.usedRefs = {
            schemas: new Set(),
            parameters: new Set(),
            responses: new Set(),
            requestBodies: new Set(),
        };
    }

    scrub(output: string): void {
        this.correct_duration_schema();
        this.correct_schema_refs(this.doc);
        this.remove_elastic_urls(this.doc);
        this.replace_es_with_os(this.doc);
        this.correct_body_refs();
        this.correct_schema_namespaces();
        _.values(this.doc.paths).flatMap(_.values).forEach((op: OperationSpec) => { this.#move_params(op); })
        _.values(this.doc.components.responses).forEach((r: OpenAPIV3.ResponseObject) => { r.description = '' });
        this.remove_redundant_items(this.doc);
        this.remove_unused_refs();

       fs.writeFileSync(output, JSON.stringify(this.doc, null, 2));
    }

    remove_redundant_items(obj: Record<string, any>): void {
        if(obj.deprecated === false) delete obj.deprecated;

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.remove_redundant_items(obj[key]);
        }
    }

    correct_duration_schema(): void {
        this.doc.components!.schemas!['_types:Duration'].pattern = "^([0-9]+)(?:d|h|m|s|ms|micros|nanos)$";
        this.doc.components!.schemas!['_types:Duration'].type = "string";
        delete this.doc.components!.schemas!['_types:Duration'].oneOf;
    }
    remove_unused_refs(): void {
        this.seenRefs = new Set();
        this.#find_refs(this.doc.paths);
        Object.keys(this.usedRefs).forEach(k => this.remove_keys(this.doc.components[k], this.usedRefs[k]));
    }

    remove_elastic_urls(obj: Record<string, any>): void {
        if(obj.externalDocs?.url?.includes('elastic')) delete obj.externalDocs;
        for(const key in obj) {
            if(typeof obj[key] === 'object') this.remove_elastic_urls(obj[key]);
        }
    }

    replace_es_with_os(obj: Record<string, any>): void {
        for(const key in obj) {
            let value = obj[key];
            if(typeof value === 'string') {
                value = value.replaceAll('Elasticsearch', 'Opensearch')
                             .replaceAll('elasticsearch', 'opensearch')
                             .replaceAll('Elastic ', 'Opensearch ');
            }
            const new_key = key.replaceAll('Elasticsearch', 'Opensearch')
                               .replaceAll('elasticsearch', 'opensearch');
            obj[new_key] = value;
            if(new_key !== key) delete obj[key];
        }
        for(const key in obj) {
            if(typeof obj[key] === 'object') this.replace_es_with_os(obj[key]);
        }
    }

    correct_schema_refs(obj: Record<string, any>): void {
        if(obj.schema?.['x-data-type'] === 'time') {
            obj.schema = {"$ref": "#/components/schemas/_types:Duration"};
            if(obj.name === 'cluster_manager_timeout') {
                obj['x-version-added'] = '2.0.0';
            } else if(obj.name === 'master_timeout') {
                obj['x-version-deprecated'] = '2.0.0';
                obj['x-deprecation-message'] = "To promote inclusive language, use 'cluster_manager_timeout' instead.";
                obj['deprecated'] = true;
            }
        }

        if(obj.name === 'time') obj.schema = {"$ref": "#/components/schemas/_types:TimeUnit"};
        if(obj.name === 'bytes') obj.schema = {"$ref": "#/components/schemas/_types:Bytes"};
        if(obj.name === 'expand_wildcards') obj.schema = {"$ref": "#/components/schemas/_types:ExpandWildcards"};

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.correct_schema_refs(obj[key]);
        }
    }

    remove_keys(obj: Record<string, any>, keys: Set<string>): void {
        for(const key in obj) {
            if(!keys.has(key)) delete obj[key];
        }
    }

    #find_refs(target: any): void {
        if(typeof target !== 'object') return;

        if(target.$ref !== undefined || this.seenRefs.has(target.$ref)) {
            if(this.seenRefs.has(target.$ref)) return;
            this.seenRefs.add(target.$ref);
            const [_pound, _components, type, name] = (target.$ref as string).split('/');
            this.usedRefs[type].add(name);
            this.#find_refs(resolve(target, this.doc));
            return;
        }

        for(const key in target) {
            this.#find_refs(target[key]);
        }
    }

    correct_body_refs(): void {
        this.#deref_bodies(this.doc.paths);
        _.values(this.doc.paths).flatMap(_.values).forEach((op: OperationSpec) => { this.#move_bodies(op); });
    }

    correct_schema_namespaces(): void {
        const schemas = this.doc.components.schemas;
        Object.entries(schemas).forEach(([k, v]) => {
            delete schemas[k];
            schemas[this.#new_schema_name(k)] = v;
        });
        this.#rename_schema_refs(this.doc);

        this.seenRefs = new Set();
        this.#determine_schema_namespace(this.doc, undefined);
        for(const [name, namespace] of Object.entries(this.schemaNamespaces)) {
            const schema = schemas[name];
            delete schemas[name];
            schemas[`${namespace}._common:${name}`] = schema;
        }
        this.#apply_schema_namespace_refs(this.doc);
    }

    #deref_bodies(obj: Record<string, any>): void {
        const app_json = obj['application/json'];
        const ref = app_json?.schema?.$ref;
        if(ref) {
            if(ref.endsWith('ResponseContent') || ref.endsWith('InputPayload') || ref.endsWith('OutputPayload') || ref.endsWith('BodyParams')) {
                app_json.schema = resolve(app_json.schema);
            }
            return;
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.#deref_bodies(obj[key]);
        }
    }

    #move_bodies(op: OperationSpec): void {
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

    #move_params(op: OperationSpec): void {
        if(!op.parameters) return;
        const parameters = op.parameters.map((p: Record<string, any>) => {
            if(p.$ref) return resolve(p) as OpenAPIV3.ParameterObject;
            else return p as OpenAPIV3.ParameterObject;
        });
        const dupNames = new Set(parameters.map(p => p.name));
        _.values(parameters.map(p => p.name)).forEach((name) => {
            if(dupNames.has(name)) dupNames.delete(name);
            else dupNames.add(name);
        });
        op.parameters = parameters.map((p) => {
            let ref : string = `${op['x-operation-group']}#${p.in}:${p.name}`;
            this.doc.components.parameters[ref] = p;
            return { $ref: `#/components/parameters/${ref}` };
        });
    }

    #determine_schema_namespace(obj: Record<string, any>, namespace: string | undefined): void {
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
            if(typeof obj[key] === 'object') this.#determine_schema_namespace(obj[key], namespace);
        }
    }

    #rename_schema_refs(obj: Record<string, any>): void {
        const ref = obj.$ref;
        if(ref?.startsWith('#/components/schemas/') && ref.includes(':')) {
            const name = ref.split('#/components/schemas/')[1];
            obj.$ref = '#/components/schemas/' + this.#new_schema_name(name);
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.#rename_schema_refs(obj[key]);
        }
    }
    #apply_schema_namespace_refs(obj: Record<string, any>) {
        const ref = obj.$ref;
        if(ref?.startsWith('#/components/schemas/') && !ref.includes(':')) {
            const name = ref.split('#/components/schemas/')[1];
            obj.$ref = '#/components/schemas/' + this.schemaNamespaces[name] + '._common:' + name;
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.#apply_schema_namespace_refs(obj[key]);
        }
    };

    #new_schema_name(name: string): string {
        const [category, type] = name.split(':');
        const parts = category.split('.');
        if(['_types', '_spec_utils'].includes(category)) return `_common:${type}`;
        if(parts[0] === '_global') return `_core.${parts[1]}:${type}`;
        if(parts[0] === '_types') return `_common.${parts[1]}:${type}`;
        if(parts[1] === '_types') return `${parts[0]}._common:${type}`;
        return name;
    }
}
