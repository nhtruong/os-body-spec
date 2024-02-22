import SpecSplitter from "./src/split_spec/SpecSplitter";


const start = async () => {
    const yaml = await SpecSplitter.init('./specs/MergedSpec.openapi.json');
    yaml.split('/Users/theotr/IdeaProjects/opensearch-api-specification/spec', 'yaml');
};


start();

