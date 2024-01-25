import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";

export default class StructureSchema extends BaseSchema {
    templateFile = 'schema.structure.mustache'
    requires: Set<string>;

    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
        this.requires = new Set<string>(spec.required || []);
    }

    view(): Record<string, any> {
        return {
            mixins: this.#mixins().map((e) => e.id()).join(', '),
            entries: Object.entries(this.#entries()).map(([k, v]) => {
                return {
                    key: k,
                    value_id: v.id(),
                    required: this.requires.has(k),
                    description: v.member_description(),
                }
            }),
        }
    }

    #mixins(): BaseSchema[] {
        if(!this.spec.allOf) { return []; }
        return this.spec.allOf
            .filter((e) => (e as OpenAPIV3.ReferenceObject).$ref)
            .map((e) => BaseSchema.fromObj(e));
    }

    #entries(): Record<string, BaseSchema> {
        let cores: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
        if(this.spec.allOf) {
            cores = this.spec.allOf.filter((e) => !(e as OpenAPIV3.ReferenceObject).$ref);
        } else {
            cores = [this.spec];
        }

        return cores
            .map((e) => (e as OpenAPIV3.SchemaObject).properties!)
            .reduce((acc, cur) => {
                for(let key in cur) { acc[key] = BaseSchema.fromObj(cur[key]); }
                return acc;
            }, {} as Record<string, BaseSchema>);
    }
}