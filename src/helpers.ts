import fs from 'fs';
import YAML from 'yaml';
import _ from 'lodash';

declare global {
    var spec_root: Record<string, any>;
}

export function resolve(obj: Record<string, any> | undefined, root: Record<string, any> = spec_root): Record<string, any> | undefined {
    if(obj === undefined || obj.$ref === undefined) return obj;

    const paths = obj.$ref.split('/');
    paths.shift();
    for(const p of paths) { root = root[p]; }
    return root;
}

export function sort_by_key(obj: Record<string, any>, priority?: string[]): Record<string, any> {
    const top: Record<string, any> = {};
    if(priority)
        for(const key of priority) {
            if(key in obj) {
                top[key] = obj[key];
                delete obj[key];
            }
        }
    const bot: Record<string, any> = _.fromPairs(Object.entries(obj).sort());
    return {...top, ...bot};
}

export function write2file(file: string, content: Record<string, any>, format: 'json' | 'yaml'): void {
    if (format === 'json') fs.writeFileSync(file + '.json', JSON.stringify(content, null, 2));
    if (format === 'yaml') fs.writeFileSync(file + '.yaml', quoteRefs(YAML.stringify(content, {lineWidth: 120, singleQuote: true})));
}

function quoteRefs(str: string): string {
    return str.split('\n').map((line) => {
        if(line.includes('$ref')) {
            const [key, value] = line.split(': ');
            if(!value.startsWith("'")) line = `${key}: '${value}'`;
        }
        return line
    }).join('\n');
}

export function extractNamespace(ops_group: string, empty = '_core'): string {
    const [_, namespace] = ops_group.split('.').reverse();
    return namespace || empty;
}

export function trait_value(value: any): string | undefined {
    if(value === undefined) return undefined;
    return typeof value === 'string' ? `"${value}"` : `${value}`;
}

export const snake2Camel = (str: string, upper = true) => {
    if (upper) return str.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
    return str.split('_').map((s, i) => i === 0 ? s : s[0].toUpperCase() + s.slice(1)).join('');
}

export const hyphen2Camel = (str: string, upper = true) => {
    if (upper) return str.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
    return str.split('-').map((s, i) => i === 0 ? s : s[0].toUpperCase() + s.slice(1)).join('');
}

export const snake2Hyphen = (str: string, capitalized = true) => {
    if (capitalized) return str.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join('-');
    return str.replace(/_/g, '-');
}

export const snake2Capitalized = (str: string) => {
    return str.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ');
}