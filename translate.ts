import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import InputsRenderer from "./src/translate_spec/renderers/InputsRenderer";
import QueryParamsRenderer from "./src/translate_spec/renderers/QueryParamsRenderer";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";
import BaseSchema from "./src/translate_spec/components/schemas/BaseSchema";

const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    // const group = translator.namespaces()['cat'].groups.find((g) => g.name === 'indices')!;
    // console.log(OperationsRenderer.render(group));
    // console.log(QueryParamsRenderer.render(group));
    // console.log(InputsRenderer.render(group));

    Object.entries(global.spec_root.components.schemas).forEach(([key, spec]) => {
        if((spec as any).type === 'boolean') console.log(BaseSchema.fromComponentKey(key).render());
    });
};

// TODO: Comma-separated path params
// TODO: OneOf schemas

// TODO: Where to put request and response bodies components?

start();