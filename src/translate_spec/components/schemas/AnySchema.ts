import BaseSchema from "./BaseSchema";

export default class AnySchema extends BaseSchema {
    templateFile = ''
    intrinsic = true;

    id(): string {
        return 'Document';
    }
}