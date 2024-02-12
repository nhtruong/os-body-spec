import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import InputsRenderer from "./src/translate_spec/renderers/InputsRenderer";
import QueryParamsRenderer from "./src/translate_spec/renderers/QueryParamsRenderer";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";
import BaseSchema from "./src/translate_spec/components/schemas/BaseSchema";
import {OpenAPIV3} from "openapi-types";
import {OperationSpec} from "./src/types";

const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    // const group = translator.namespaces()['undefined'].groups.find((g) => g.name === 'create')!;
    // console.log(OperationsRenderer.render(group));
    // console.log(QueryParamsRenderer.render(group));
    // console.log(InputsRenderer.render(group));
    // group.crawl_schemas()
    // Object.values(translator.namespaces()).forEach((ns) => {
    //     ns.groups.forEach((group) => {
    //         console.log(group.group);
    //         group.crawl_schemas();
    //     });
    // });

    Object.entries(global.spec_root.paths).forEach(([path, methods]) => {
        const namespaces = Object.values(methods as OperationSpec[]).map((method) => {
            const [_, namespace] = method['x-operation-group'].split('.').reverse();
            return namespace;
        });

        const uniqueNamespaces = Array.from(new Set(namespaces));
        if(uniqueNamespaces.length !== 1) {
            console.log(`Path: ${path}`);
            console.log(`Namespaces: ${uniqueNamespaces.join(', ')}`);
        }
    });

    // Object.entries(global.spec_root.components.schemas).forEach(([key, spec]) => {
    //     const s = spec as OpenAPIV3.SchemaObject;
    //     // if(s.type === 'boolean') console.log(BaseSchema.fromComponentKey(key).render());
    //     // if(s.enum) console.log(BaseSchema.fromComponentKey(key).render());
    //     // if(s.type === 'array') console.log(BaseSchema.fromComponentKey(key).render());
    //     // if(s.type === 'number') console.log(BaseSchema.fromComponentKey(key).render());
    //     // if(s.type === 'string') console.log(BaseSchema.fromComponentKey(key).render());
    //     // if(s.oneOf) console.log(BaseSchema.fromComponentKey(key).render());
    //     // if(s.type == 'object') console.log(BaseSchema.fromComponentKey(key).render());
    //     // console.log(BaseSchema.fromComponentKey(key).render());
    // });
};

// TODO: Where to put request and response bodies components?
// TODO: Shared query parameters within a namespace (esp. for cat)

start();