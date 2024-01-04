export function resolve(obj: Record<string, any> | undefined, root: Record<string, any>): Record<string, any> | undefined {
    if(obj === undefined || obj.$ref === undefined) return obj;

    const paths = obj.$ref.split('/');
    paths.shift();
    for(const p of paths) { root = root[p]; }
    return root;
}