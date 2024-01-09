import Merger from "./src/merge_spec/Merger"
import Scrubber from "./src/merge_spec/Scrubber";

const start = async () => {
    const merger = await Merger.init('specs/ElasticSearch.openapi.json', 'specs/OpenSearch.openapi.json');
    merger.merge('specs/MergedSpec.openapi.json')

    const scrubber = new Scrubber('specs/MergedSpec.openapi.json');
    scrubber.scrub();
}

start();