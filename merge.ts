import Merger from "./merge_spec/Merger"
import Scrubber from "./merge_spec/Scrubber";

const start = async () => {
    // const merger = await Merger.init('./tmp/ElasticSearch.openapi.json', './tmp/OpenSearch.openapi.json');
    // merger.merge('./MergedSpec.openapi.json')

    const scrubber = new Scrubber('./MergedSpec.openapi.json');
    scrubber.scrub();
}

start();