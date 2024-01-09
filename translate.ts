import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";


const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    const group = translator.namespaces()['nodes'].groups.find((g) => g.name === 'hot_threads')!;
    const renderder = new OperationsRenderer(group);
    console.log(renderder.render());
};

start();