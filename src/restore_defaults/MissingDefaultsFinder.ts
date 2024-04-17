import {OpenAPIV3} from "openapi-types";
import _ from "lodash";
import {resolve} from "../helpers";


interface Default {
    origin: Set<any>;
    current: any;
}

export default class MissingDefaultsFinder {
    origin: OpenAPIV3.Document;
    current: OpenAPIV3.Document;
    defaults: Record<string, Default> = {};
    constructor(origin: OpenAPIV3.Document, current: OpenAPIV3.Document) {
        this.origin = origin;
        this.current = current;
    }

    find(): Record<string, any> {
        this.defaults = {};
        _.entries(this.origin.paths).map(([path, pathItem]) => {
            return _.entries(pathItem).map(([method, operation]) => {
                let origin_params = ((operation as OpenAPIV3.OperationObject).parameters || []).map((param) => resolve(param, this.origin)) as OpenAPIV3.ParameterObject[];
                let current_params = ((this.current.paths as any)[path][method]).parameters as OpenAPIV3.ReferenceObject[];
                for(const ref_obj of current_params) {
                    const current = resolve(ref_obj, this.current) as (OpenAPIV3.ParameterObject | undefined);
                    if(!current) continue;
                    const origin = origin_params.find((origin) => origin.in === current.in && origin.name === current.name);
                    if(!origin) continue;
                    this.process_param(origin, current, ref_obj);
                }
            })
        });

        return _.fromPairs(_.entries(this.defaults)
            .filter(([_, def]) => !def.origin.has(def.current))
            .map(([ref, def]) => [ref, def.origin.values().next().value]));
    }

    _default(ref: string): Default {
        if(!this.defaults[ref]) {
            this.defaults[ref] = {origin: new Set(), current: '' };
        }
        return this.defaults[ref];
    }

    process_param(origin: OpenAPIV3.ParameterObject, current: OpenAPIV3.ParameterObject, ref_obj: OpenAPIV3.ReferenceObject): void {
        const def = this._default(ref_obj.$ref);
        def.origin.add(resolve(origin.schema, this.origin)?.default);
        def.current = resolve(current.schema, this.current)?.default;
    }
}