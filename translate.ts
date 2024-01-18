import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import InputsRenderer from "./src/translate_spec/renderers/InputsRenderer";
import QueryParamsRenderer from "./src/translate_spec/renderers/QueryParamsRenderer";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";


const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    const group = translator.namespaces()['cat'].groups.find((g) => g.name === 'indices')!;
    // // OperationsRenderer.render(group)
    console.log(InputsRenderer.render(group));
    console.log(QueryParamsRenderer.render(group));

    // const set = new Set(Object.keys(global.spec_root.components.schemas).map((k) => {
    //     return k.split(':')[0] }));
    // console.log(Array.from(set).sort());
};

start();