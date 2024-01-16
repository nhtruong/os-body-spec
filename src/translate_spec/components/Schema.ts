import {OpenAPIV3} from "openapi-types";
import {resolve, snake2Camel} from "../../helpers";
import _ from "lodash";

export default class Schema {
    spec: OpenAPIV3.SchemaObject;
    ref: string | undefined; // Reference key used to build Smithy model ID
    id: string | undefined; // Smithy model ID

    type: string;
    default?: any;
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        this.spec = spec;
        this.ref = ref
        this.type = this.#type();
        this.id = this.#id();
        this.default = this.spec.default;
    }

    static fromObj(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): Schema {
        const ref = (obj as OpenAPIV3.ReferenceObject).$ref?.split('/').pop();
        return new Schema(resolve(obj) as OpenAPIV3.SchemaObject, ref);
    }

    static fromComponentKey(ref: string): Schema {
        const spec = global.spec_root.components.schemas[ref];
        return new Schema(spec, ref);
    }

    #id(): string {
        if (this.ref) {
            const name = this.ref.split(':').pop()!;
            const components = this.ref.split(':')[0].split('.');
            const prefix = components.filter((c) => c !== '_global' && c !== '_types')
                                     .map((c) => snake2Camel(c)).join('_');
            return prefix ? `${prefix}_${name}` : name;
        }
        return _.capitalize(this.type);
    }

    #type(): string {
        if(this.spec.type) return this.spec.type;

        return 'Unknown type';
    }

}