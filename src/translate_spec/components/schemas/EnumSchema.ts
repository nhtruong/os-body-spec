import BaseSchema from "./BaseSchema";
import {trait_value} from "../../../helpers";

export default class EnumSchema extends BaseSchema {
    templateFile = 'schema.enum.mustache'

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