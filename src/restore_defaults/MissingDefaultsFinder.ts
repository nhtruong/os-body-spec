import {OpenAPIV3} from "openapi-types";

export default class MissingDefaultsFinder {
    origin: OpenAPIV3.Document;
    target: OpenAPIV3.Document;
    constructor(origin: OpenAPIV3.Document, target: OpenAPIV3.Document) {
        this.origin = origin;
        this.target = target;
    }

    find(): Record<string, any> {
        return {};
    }
}