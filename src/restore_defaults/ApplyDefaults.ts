import _ from "lodash";
import {resolve} from "../helpers";
import SpecFile from "./SpecFile";

export default class ApplyDefaults {
    folder: string;
    defaults: { namespace: SpecFile, ref: string, def: any }[];
    namespaces: Record<string, SpecFile> = {};

    constructor(folder: string, defaults: Record<string, any>) {
        this.folder = folder;
        this.defaults = _.entries(defaults).map(([ref, def]) => { return { namespace: this.ns_file(this.extract_namespace(ref)), ref, def }});
    }

    apply(): void {
        this.defaults.forEach(({namespace, ref, def}) => {
            const param = resolve({$ref: ref}, namespace.spec)!;
            const schema = param.schema as Record<string, any>;
            if(schema.$ref) param['x-default'] = def;
            else schema.default = def;
        });

        _.values(this.namespaces).forEach((ns) => ns.write());
    }

    extract_namespace(ref: string): string {
        const group = ref.split('#/components/parameters/')[1].split('::')[0];
        return group.indexOf('.') > -1 ? group.split('.')[0] : '_core';
    }

    ns_file(namespace: string): SpecFile {
        if(!this.namespaces[namespace]) {
            this.namespaces[namespace] = new SpecFile(`${this.folder}/namespaces/${namespace}.yaml`);
        }
        return this.namespaces[namespace];
    }
}