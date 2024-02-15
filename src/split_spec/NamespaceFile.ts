import {OpenAPIV3} from "openapi-types";

export default class NamespaceFile {
    name: string;
    paths: OpenAPIV3.PathsObject = {};
    requestBodies: { [key: string]: OpenAPIV3.RequestBodyObject; } = {};
    responses: { [key: string]: OpenAPIV3.ResponseObject; } = {};
    parameters: { [key: string]: OpenAPIV3.ParameterObject; } = {};

    constructor(name: string) {
        this.name = name;
    }
}