import {OpenAPIV3} from "openapi-types";
import {capitalize} from "lodash";

export default class NamespaceFile {
    name: string;
    paths: OpenAPIV3.PathsObject = {};
    requestBodies: { [key: string]: OpenAPIV3.RequestBodyObject; } = {};
    responses: { [key: string]: OpenAPIV3.ResponseObject; } = {};
    parameters: { [key: string]: OpenAPIV3.ParameterObject; } = {};

    constructor(name: string) {
        this.name = name;
    }

    contents(): Record<string, any> {
        const rawContents = this.#rawContents();
        this.#move_schemas(rawContents);
        return {
            openapi: '3.1.0',
            info: {
                title: `OpenSearch ${capitalize(this.name)} API`,
                description: `OpenSearch ${capitalize(this.name)} API`,
                version: '1.0.0'
            },
            ...this.#rawContents(),
        };
    }

    #move_schemas(obj: Record<string, any>): void {
        const ref = obj.$ref;
        if(ref?.startsWith('#/components/schemas/')) {
            const name = ref.split('#/components/schemas/')[1];
            const [category, type] = name.split(':');
            obj.$ref = `../schemas/${category}.json#/${type}`;
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.#move_schemas(obj[key]);
        }
    }

    #rawContents(): Record<string, any> {
        return {
            paths: this.paths,
            components: {
                requestBodies: this.requestBodies,
                responses: this.responses,
                parameters: this.parameters
            }
        };
    }
}