import {OpenAPIV3} from "openapi-types";
import {resolve, snake2Camel, trait_value} from "../../../helpers";
import SchemaRenderer from "../../renderers/SchemaRenderer";

export default class BaseSchema {
    // TODO: pattern
    // TODO: x-data-type
    
    templateFile: string = '';

    basic_type?: string;
    intrinsic: boolean = false;

    spec: OpenAPIV3.SchemaObject;
    ref: string | undefined; // Reference key used to build Smithy model ID
    _id?: string; // Cached Smithy model ID

    default?: any;
    description?: string;

    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        this.spec = spec;
        this.ref = ref
        this.default = this.spec.default;
        this.description = this.spec.description;
    }

    static create(spec: OpenAPIV3.SchemaObject, ref?: string): BaseSchema {
        if (spec.enum) return new (require('./EnumSchema').default)(spec, ref);
        if (spec.oneOf) return new (require('./UnionSchema').default)(spec, ref);
        if (spec.additionalProperties) return new (require('./MapSchema').default)(spec, ref);
        if (spec.allOf) return new (require('./StructureSchema').default)(spec, ref);
        if (spec.type === undefined) return new (require('./AnySchema').default)(spec, ref);
        if (spec.type === 'object') return new (require('./StructureSchema').default)(spec, ref);
        if (spec.type === 'string') return new (require('./StringSchema').default)(spec, ref);
        if (spec.type === 'boolean') return new (require('./BooleanSchema').default)(spec, ref);
        if (spec.type === 'array') return new (require('./ListSchema').default)(spec, ref);
        if (['number', 'integer'].includes(spec.type!)) return new (require('./NumberSchema').default)(spec, ref);

        throw new Error('Unknown schema type');
    }

    static fromObj(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, path: boolean = false): BaseSchema {
        const ref = (obj as OpenAPIV3.ReferenceObject).$ref?.split('/').pop();
        if(path) return new (require('./ParameterSchema').default)(obj as OpenAPIV3.SchemaObject, ref);
        return BaseSchema.create(resolve(obj) as OpenAPIV3.SchemaObject, ref);
    }

    // Should only be used during development
    static fromComponentKey(ref: string): BaseSchema {
        const spec = global.spec_root.components.schemas[ref];
        return BaseSchema.create(spec, ref);
    }

    view(): Record<string, any> {
        return {};
    }

    common(): Record<string, any> {
        return {
            id: this.id(),
            basic_type: this.basic_type,
            default: trait_value(this.default),
            description: this.description,
        }
    }

    render(): string {
        return SchemaRenderer.render(this);
    }

    id(): string {
        if(!this._id) this._id = this.ref_id() || this.native_id();
        return this._id;
    }

    ref_id(): string | undefined {
        if(!this.ref) return undefined;

        const name = snake2Camel(this.ref.split(':').pop()!);
        const components = this.ref.split(':')[0].split('.');
        const prefix = components.filter((c) => !c.startsWith('_'))
                                 .map((c) => snake2Camel(c)).join('_');
        return prefix ? `${prefix}_${name}` : name;
    }

    native_id(): string {
        // TODO uncomment this line
        // throw new Error('Not implemented');
        return 'UNKNOWN NATIVE ID'
    }

    member_description(): string | undefined {
        if(this.ref) return undefined;
        return this.description;
    }
}