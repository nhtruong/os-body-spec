import fs from 'fs';
import {resolve} from './helpers';

export default class Scrubber {
    file: string | undefined;
    doc: Record<string, any>;

    refs: Record<string, Set<string>>;
    seen: Set<string> = new Set();

    constructor(doc: Record<string, any> | string) {
        this.file = typeof doc === 'string' ? doc : undefined;
        this.doc = typeof doc === 'string' ? JSON.parse(fs.readFileSync(doc).toString()) : doc;
        this.refs = {
            schemas: new Set(),
            parameters: new Set(),
            responses: new Set(),
            requestBodies: new Set(),
        };
    }

    scrub(): void {
        this.remove_unused_refs();
        this.remove_elastic_urls(this.doc);
        // TODO: replace ES with OS

        if (this.file) fs.writeFileSync(this.file, JSON.stringify(this.doc, null, 2));
    }

    remove_unused_refs(): void {
        this.#find_refs(this.doc.paths);
        Object.keys(this.refs).forEach(k => this.remove_keys(this.doc.components[k], this.refs[k]));
    }

    remove_elastic_urls(obj: Record<string, any>): void {
        if(obj.externalDocs?.url?.includes('elastic.co')) delete obj.externalDocs;
        for(const key in obj) {
            if(typeof obj[key] === 'object') this.remove_elastic_urls(obj[key]);
        }
    }

    remove_keys(obj: Record<string, any>, keys: Set<string>): void {
        for(const key in obj) {
            if(!keys.has(key)) delete obj[key];
        }
    }

    #find_refs(target: any): void {
        if(typeof target !== 'object') return;

        if(target.$ref !== undefined || this.seen.has(target.$ref)) {
            if(this.seen.has(target.$ref)) return;
            this.seen.add(target.$ref);
            const ref = (target.$ref as string).split('/');
            this.refs[ref[2]].add(ref[3]);
            this.#find_refs(resolve(target, this.doc));
            return;
        }

        for(const key in target) {
            this.#find_refs(target[key]);
        }
    }
}