import {OpenAPIV3} from "openapi-types";
import _ from "lodash";
import Parameter from "./Parameter";

export default class OperationParameters {
    parameters: Record<string, Parameter>

    constructor(spec: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] = [], root: OpenAPIV3.Document) {
        this.parameters = _.keyBy(spec.map(p => new Parameter(p, root)), 'key');
    }

    static merge(os: OperationParameters, es: OperationParameters): (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] {
        return Object.keys(os.parameters).map(k => Parameter.merge(os.parameters[k], es.parameters[k]));
    }
}