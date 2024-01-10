import {OperationSpec, ParameterSpec} from "./types";
import Parameter from "./Parameter";
import Body from "./Body";
import {OpenAPIV3} from "openapi-types";
import {snake2Camel} from "../../helpers";
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
    body: Body | undefined;
    api_ref: string | undefined;

    constructor(path: string, verb: string, spec: OperationSpec) {
        this.path = path;
        this.verb = verb;
        this.spec = spec;
        this.deprecated = spec.deprecated || false;
        this.ignored = spec['x-ignorable'] || false;
        this.group = spec['x-operation-group'];
        const parameters = (spec.parameters as ParameterSpec[] || []).map((p) => new Parameter(p));
        this.pathParams = parameters.filter((p) => p.inPath);
        this.queryParams = parameters.filter((p) => p.inQuery);
        this.body = spec.requestBody ? new Body(spec.requestBody as OpenAPIV3.RequestBodyObject) : undefined;
        this.api_ref = spec.externalDocs?.url;
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