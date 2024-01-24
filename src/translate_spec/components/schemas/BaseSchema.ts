import {OpenAPIV3} from "openapi-types";
import {resolve, snake2Camel, trait_value} from "../../../helpers";
import SchemaRenderer from "../../renderers/SchemaRenderer";

export default class BaseSchema {
    templateFile: string = '';

    basic_type?: string;

    spec: OpenAPIV3.SchemaObject;
    ref: string | undefined; // Reference key used to build Smithy model ID
    id: string; // Smithy model ID

    default?: any;
    description?: string;

    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        this.spec = spec;
        this.ref = ref
        this.id = this.#id();
        this.default = this.spec.default;
        this.description = this.spec.description;
    }

    static create(spec: OpenAPIV3.SchemaObject, ref?: string): BaseSchema {
        if (spec.enum) return new (require('./EnumSchema').default)(spec, ref);
        if (spec.type === 'string') return new (require('./StringSchema').default)(spec, ref);
        if (spec.type === 'number') return new (require('./IntegerSchema').default)(spec, ref);
        if (spec.type === 'boolean') return new (require('./BooleanSchema').default)(spec, ref);
        if (spec.type === 'array') return new (require('./ListSchema').default)(spec, ref);

        // TODO uncomment this line
        // throw new Error('Unknown schema type');

        return new BaseSchema(spec, ref);
    }

    static fromObj(obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): BaseSchema {
        const ref = (obj as OpenAPIV3.ReferenceObject).$ref?.split('/').pop();
        return BaseSchema.create(resolve(obj) as OpenAPIV3.SchemaObject, ref);
    }

    static fromComponentKey(ref: string): BaseSchema {
        const spec = global.spec_root.components.schemas[ref];
        return BaseSchema.create(spec, ref);
    }

    view(): Record<string, any> {
        return {};
    }

    common(): Record<string, any> {
        return {
            id: this.id,
            basic_type: this.basic_type,
            default: trait_value(this.default),
            description: this.description,
        }
    }

    render(): string {
        return SchemaRenderer.render(this);
    }

    #id(): string {
        if (this.ref) {
            const name = snake2Camel(this.ref.split(':').pop()!);
            const components = this.ref.split(':')[0].split('.');
            const prefix = components.filter((c) => !c.startsWith('_'))
                                     .map((c) => snake2Camel(c)).join('_');
            return prefix ? `${prefix}_${name}` : name;
        }
        return 'unknown'; // TODO Handle this case
    }
}