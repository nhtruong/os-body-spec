import {OpenAPIV3} from "openapi-types";
import {resolve, snake2Camel} from "../../../helpers";
import _ from "lodash";

export default class BaseSchema {
    spec: OpenAPIV3.SchemaObject;
    ref: string | undefined; // Reference key used to build Smithy model ID
    id: string | undefined; // Smithy model ID

    default?: any;
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        this.spec = spec;
        this.ref = ref
        this.id = this.#id();
        this.default = this.spec.default;
    }

    static fromObj(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): BaseSchema {
        const ref = (obj as OpenAPIV3.ReferenceObject).$ref?.split('/').pop();
        return new BaseSchema(resolve(obj) as OpenAPIV3.SchemaObject, ref);
    }

    static fromComponentKey(ref: string): BaseSchema {
        const spec = global.spec_root.components.schemas[ref];
        return new BaseSchema(spec, ref);
    }

    view(): Record<string, any> {
        throw new Error('Not implemented');
    }

    #id(): string {
        if (this.ref) {
            const name = this.ref.split(':').pop()!;
            const components = this.ref.split(':')[0].split('.');
            const prefix = components.filter((c) => !c.startsWith('_'))
                                     .map((c) => snake2Camel(c)).join('_');
            return prefix ? `${prefix}_${name}` : name;
        }
        return 'unknown'; // TODO Handle this case
    }
}