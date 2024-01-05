import {OpenAPIV3} from "openapi-types";
import {resolve} from "./helpers";

export default class Parameter {
    spec: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject;
    resolved: OpenAPIV3.ParameterObject;
    key: string;

    constructor(spec: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject, root: OpenAPIV3.Document) {
        this.spec = spec;
        this.resolved = resolve(spec, root) as OpenAPIV3.ParameterObject;
        this.key = `${this.resolved.name}:${this.resolved.in}`;
        this.#handle_edge_cases();
    }

    #handle_edge_cases(): void {
        if (this.resolved.name === 'cluster_manager_timeout') {
            const resolved = this.resolved as Record<string, any>;
            resolved.schema = { "$ref": "#/components/schemas/_types:Duration" }
            resolved['x-version-added'] = '2.0.0';
            return;
        }

        if (this.resolved.name === 'master_timeout') {
            const resolved = this.resolved as Record<string, any>;
            resolved['x-version-deprecated'] = '2.0.0';
            resolved['x-deprecation-message'] = "To promote inclusive language, use 'cluster_manager_timeout' instead.";
            resolved['deprecated'] = true;
            return;
        }
    }

    static merge(os: Parameter, es: Parameter | undefined): OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject {
        if(es === undefined) return os.spec;
        const es_schema = resolve(es.resolved.schema, global.es_root)!;
        const os_schema = resolve(os.resolved.schema, global.os_root)!;
        if(os_schema['x-data-type'] === 'time') es_schema['x-data-type'] = os_schema['x-data-type'];
        es.resolved = { ...os.resolved,
            description: es.resolved.description,
            schema: es.resolved.schema };
        return es.spec;
    }
}