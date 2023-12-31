export function resolve(obj: Record<string, any> | undefined, root: Record<string, any>): Record<string, any> | undefined {
    if(obj === undefined || obj.$ref === undefined) return obj;

    const paths = obj.$ref.split('/');
    paths.shift();
    for(const p of paths) { root = root[p]; }
    return root;
}

export function disp_value(value: any): string {
    return typeof value === 'string' ? `"${value}"` : value;
}

export const snake2Camel = (str: string, upper = true) => {
    if (upper) return str.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
    return str.split('_').map((s, i) => i === 0 ? s : s[0].toUpperCase() + s.slice(1)).join('');
}

export const snake2Hyphen = (str: string, capitalized = true) => {
    if (capitalized) return str.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join('-');
    return str.replace(/_/g, '-');
}

export const snake2Capitalized = (str: string) => {
    return str.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ');
}