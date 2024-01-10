import SmithyGenerator from "./src/translate_spec/SmithyGenerator";
import InputsRenderer from "./src/translate_spec/renderers/InputsRenderer";
import OperationsRenderer from "./src/translate_spec/renderers/OperationsRenderer";


const start = async () => {
    const translator = await SmithyGenerator.init('./specs/MergedSpec.openapi.json');
    const group = translator.namespaces()['undefined'].groups.find((g) => g.name === 'bulk')!;
    OperationsRenderer.render(group)
    InputsRenderer.render(group)
};

start();