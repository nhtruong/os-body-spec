import Merger from "./src/merge_spec/Merger"
import Scrubber from "./src/merge_spec/Scrubber";
import Polisher from "./src/merge_spec/Polisher";

const start = async () => {
    // const merger = await Merger.init('specs/ElasticSearch.openapi.json', 'specs/OpenSearch.openapi.json');
    // merger.merge('specs/CrudSpec.openapi.json')
    //
    const scrubber = new Scrubber('specs/CrudSpec.openapi.json');
    scrubber.scrub('specs/ScrubbedSpec.openapi.json');

    const polisher = new Polisher('specs/ScrubbedSpec.openapi.json');
    polisher.polish('specs/MergedSpec.openapi.json');
}

start();