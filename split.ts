import SpecSplitter from "./src/split_spec/SpecSplitter";


const start = async () => {
    const yaml = await SpecSplitter.init('./specs/MergedSpec.openapi.json');
    yaml.split('./specs/split_yaml/', 'yaml');
    const json = await SpecSplitter.init('./specs/MergedSpec.openapi.json');
    json.split('./specs/split/', 'json');
};


start();

