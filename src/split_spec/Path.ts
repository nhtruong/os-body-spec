import {OpenAPIV3} from "openapi-types";
import _ from "lodash";
import {OperationSpec} from "../types";
import {extractNamespace} from "../helpers";

const HTTP_VERBS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
export default class Path {
    path: string;
    spec: OpenAPIV3.PathItemObject;
    namespace: string;
    constructor(path: string, spec: OpenAPIV3.PathItemObject) {
        this.path = path;
        this.spec = spec;
        this.namespace = this.#namespace();
    }

    #namespace(): string {
        const operation = Object.values(_.pick(this.spec, HTTP_VERBS))[0] as OperationSpec;
        return extractNamespace(operation['x-operation-group']);
    }
}