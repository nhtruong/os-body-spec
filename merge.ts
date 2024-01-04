import Merger from "./merge_spec/Merger"

const start = async () => {
    const merger = await Merger.init('./tmp/ElasticSearch.openapi.json', './tmp/OpenSearch.openapi.json');
    merger.merge('./MergedSpec.openapi.json')
}

start();