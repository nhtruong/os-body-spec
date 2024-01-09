import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import OperationRenderer from "./src/translate_spec/renderers/OperationRenderer";


const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    const group = translator.namespaces()['nodes'].groups.find((g) => g.name === 'hot_threads')!;
    const operation = group.operations.find((o) => o.verb === 'get' && o.path === '/_cluster/nodes/hot_threads')!;
    const renderder = new OperationRenderer(operation);
    console.log(renderder.render());
};

start();