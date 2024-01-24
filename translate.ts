import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import InputsRenderer from "./src/translate_spec/renderers/InputsRenderer";
import QueryParamsRenderer from "./src/translate_spec/renderers/QueryParamsRenderer";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";
import BaseSchema from "./src/translate_spec/components/schemas/BaseSchema";
import {OpenAPIV3} from "openapi-types";

const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    // const group = translator.namespaces()['cat'].groups.find((g) => g.name === 'indices')!;
    // console.log(OperationsRenderer.render(group));
    // console.log(QueryParamsRenderer.render(group));
    // console.log(InputsRenderer.render(group));

    Object.entries(global.spec_root.components.schemas).forEach(([key, spec]) => {
        const s = spec as OpenAPIV3.SchemaObject;
        // if(s.type === 'boolean') console.log(BaseSchema.fromComponentKey(key).render());
        // if(s.enum) console.log(BaseSchema.fromComponentKey(key).render());
        // if(s.type === 'array') console.log(BaseSchema.fromComponentKey(key).render());
        // if(s.type === 'number') console.log(BaseSchema.fromComponentKey(key).render());
        // if(s.type === 'string') console.log(BaseSchema.fromComponentKey(key).render());
        if(s.oneOf) console.log(BaseSchema.fromComponentKey(key).render());
    });
};

// TODO: Comma-separated path params
// TODO: OneOf schemas

// TODO: Where to put request and response bodies components?

start();