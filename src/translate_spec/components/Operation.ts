import {OperationSpec, ParameterSpec} from "./types";
import Parameter from "./Parameter";
import RequestBody from "./RequestBody";
import {OpenAPIV3} from "openapi-types";
import {resolve, snake2Camel} from "../../helpers";
export default class Operation {
    spec: OperationSpec;
    ignored: boolean;
    deprecated: boolean;
    group: string; // operation group
    path: string; // path to endpoint
    verb: string; // HTTP verb
    order: number | null = null;
    pathParams: Array<Parameter>;
    queryParams: Array<Parameter>;
    body: RequestBody | undefined;
    api_ref: string | undefined;

    constructor(path: string, verb: string, spec: OpenAPIV3.OperationObject | OpenAPIV3.ReferenceObject) {
        this.path = path;
        this.verb = verb;
        this.spec = resolve(spec) as OperationSpec;
        this.deprecated = this.spec.deprecated || false;
        this.ignored = this.spec['x-ignorable'] || false;
        this.group = this.spec['x-operation-group'];
        const parameters = (this.spec.parameters as ParameterSpec[] || []).map((p) => new Parameter(p));
        this.pathParams = parameters.filter((p) => p.spec.in === 'path');
        this.queryParams = parameters.filter((p) => p.spec.in === 'query');
        this.body = this.spec.requestBody ? new RequestBody(this.spec.requestBody as OpenAPIV3.RequestBodyObject) : undefined;
        this.api_ref = this.spec.externalDocs?.url;
    }

    id(): string {
        const main = this.group.split('.').map((s) => snake2Camel(s)).join('_')
        return this.order === null ? `OP_${main}` : `OP_${main}_${this.order}`;
    }

    inputId(): string {
        return this.id() + '_INPUT';
    }

    outputId(): string {
        return this.id() + '_OUTPUT';
    }
}