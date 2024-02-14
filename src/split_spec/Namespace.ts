import {OpenAPIV3} from "openapi-types";
import Path from "./Path";

export default class Namespace {
    name: string;
    paths: Path[];
    requestBodies: { [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject; };
    responses: { [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject; };
    schemas: { [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject; };

    constructor(name: string, paths: Path[],
                requestBodies: { [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject; },
                responses: { [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject; },
                schemas: { [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject; }) {
        this.name = name;
        this.paths = paths;
        this.requestBodies = requestBodies;
        this.responses = responses;
        this.schemas = schemas;
    }
}