import {OpenAPIV3} from "openapi-types";
import {capitalize} from "lodash";
import {sort_by_key} from "../helpers";

export default class NamespaceFile {
    readonly OP_PRIORITY = ['operationId', 'x-operation-group', 'x-ignorable', 'deprecated',
        'x-deprecation-message', 'x-version-added', 'x-version-deprecated', 'x-version-removed',
        'description', 'externalDocs', 'parameters', 'requestBody', 'responses'];

    name: string;
    format: 'json' | 'yaml';
    paths: OpenAPIV3.PathsObject = {};
    requestBodies: { [key: string]: OpenAPIV3.RequestBodyObject; } = {};
    responses: { [key: string]: OpenAPIV3.ResponseObject; } = {};
    parameters: { [key: string]: OpenAPIV3.ParameterObject; } = {};

    constructor(name: string, format: 'json' | 'yaml') {
        this.name = name;
        this.format = format;
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
            obj.$ref = `../schemas/${category}.${this.format}#/components/schemas/${type}`;
        }

        for(const key in obj) {
            if(typeof obj[key] === 'object') this.#move_schemas(obj[key]);
        }
    }

    #rawContents(): Record<string, any> {
        return {
            paths: this.#sorted_paths(),
            components: {
                requestBodies: sort_by_key(this.requestBodies),
                responses: sort_by_key(this.responses),
                parameters: sort_by_key(this.parameters),
            }
        };
    }

    #sorted_paths(): Record<string, any> {
        Object.values(this.paths as Record<string, any>).forEach((path) => {
            Object.entries(path).forEach(([verb, operation]) => {
                path[verb as keyof OpenAPIV3.PathItemObject] = sort_by_key(operation as Record<string, any>, this.OP_PRIORITY);
            });
        });
        return sort_by_key(this.paths);
    }
}