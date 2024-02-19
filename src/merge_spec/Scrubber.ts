import fs from 'fs';
import {resolve} from '../helpers';

export default class Scrubber {
    doc: Record<string, any>;

    schemaNamespaces: Record<string, string> = {};
    usedRefs: Record<string, Set<string>>;
    seenRefs: Set<string> = new Set();

    constructor(file: string) {
        this.doc = JSON.parse(fs.readFileSync(file).toString());
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
        this.remove_unused_refs();
        this.remove_elastic_urls(this.doc);
        this.replace_es_with_os(this.doc);

       fs.writeFileSync(output, JSON.stringify(this.doc, null, 2));
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
}
