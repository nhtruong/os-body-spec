
import Namespace from "./components/Namespace";
import Operation from "./components/Operation";
import SwaggerParser from "@apidevtools/swagger-parser";
import _ from "lodash";
import {OpenAPIV3} from "openapi-types";
import {OperationSpec} from "../types";
import OperationGroup from "./components/OperationGroup";

const HTTP_VERBS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default class SmithyGenerator {

    constructor(spec: OpenAPIV3.Document) {
        global.spec_root = spec;
    }

    /**
     * Initialize the generator. Use this instead of the constructor directly.
     * @param spec path to the spec file
     */
    static async init(spec: string) {
        return new SmithyGenerator(await SwaggerParser.parse(spec) as OpenAPIV3.Document);
    }

    generate(rootDir: string = '../'): void {

    }

    namespaces(): _.Dictionary<Namespace> {
        const paths = Object.entries(global.spec_root.paths as OpenAPIV3.PathsObject);
        const operations = paths.flatMap(([path, spec]) => {
            return Object.entries(_.pick(spec, HTTP_VERBS)).map(([verb, spec]) => {
                return new Operation(path, verb, spec as OperationSpec);
            });
        });

        const groups = Object.entries(_.groupBy(operations, 'group')).map(([group, operations]) => {
            return new OperationGroup(group, operations);
        });

        const namespaces: _.Dictionary<any> = _.groupBy(groups, (group) => group.namespace);
        Object.entries(namespaces).forEach(([name, groups]) => {
            namespaces[name] = new Namespace(name, groups);
        });
        return namespaces;
    }
}