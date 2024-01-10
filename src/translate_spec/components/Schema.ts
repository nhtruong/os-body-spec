import {OpenAPIV3} from "openapi-types";
import {resolve} from "../../helpers";

export default class Schema {
    spec: OpenAPIV3.SchemaObject;
    ref: string | undefined;
    id: string;
    type?: string;
    default?: any;
    constructor(spec: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject) {
        this.spec = resolve(spec) as OpenAPIV3.SchemaObject;
        this.ref = (spec as OpenAPIV3.ReferenceObject).$ref
        this.id = this.#id(spec);
        this.type = this.spec.type;
        this.default = this.spec.default;
    }

    #id(spec: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
        if (this.ref) {
            return this.ref.split('/').pop()!;
        }
        console.log(spec);
        return this.spec.type!;
    }

}