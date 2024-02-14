import SpecSplitter from "./src/split_spec/SpecSplitter";


const start = async () => {
    const splitter = await SpecSplitter.init('./specs/MergedSpec.openapi.json');
    splitter.split('./specs/split/');
};


start();

