import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import InputsRenderer from "./src/translate_spec/renderers/InputsRenderer";
import QueryParamsRenderer from "./src/translate_spec/renderers/QueryParamsRenderer";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";

const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    const group = translator.namespaces()['cat'].groups.find((g) => g.name === 'indices')!;
    console.log(OperationsRenderer.render(group));
    console.log(QueryParamsRenderer.render(group));
    console.log(InputsRenderer.render(group));

    // const set = new Set(Object.keys(global.spec_root.components.schemas).map((k) => {
    //     return k.split(':')[0] }));
    // console.log(Array.from(set).sort());
};

// TODO: Comma-separated path params
// TODO: OneOf schemas
// TODO: AllOf schemas
// TODO: minProperties, maxProperties
// TODO: enum
// TODO: Where to put request and response bodies components?

start();