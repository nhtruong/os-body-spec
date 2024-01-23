import BaseSchema from "./BaseSchema";
import {OpenAPIV3} from "openapi-types";
import {trait_value} from "../../../helpers";

export default class EnumSchema extends BaseSchema {
    templateFile = 'schema.enum.mustache'
    constructor(spec: OpenAPIV3.SchemaObject, ref?: string) {
        super(spec, ref);
    }

    view(): Record<string, any> {
        return {
            entries: this.spec.enum!.map((e: string) => {
                return {
                    key: e.toUpperCase(),
                    value: trait_value(e),
                }
            }),
        }
    }
}