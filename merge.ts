import Merger from "./src/merge_spec/Merger"
import Scrubber from "./src/merge_spec/Scrubber";
import {write2file} from "./src/helpers";

const start = async () => {
    const merger = await Merger.init('specs/ElasticSearch.openapi.json', 'specs/OpenSearch.openapi.json');
    merger.merge('specs/CrudMergedSpec.openapi.json')

    const scrubber = new Scrubber('specs/CrudMergedSpec.openapi.json');
    scrubber.scrub('specs/MergedSpec.openapi.json');

    // write2file('/Users/theotr/IdeaProjects/opensearch-api-specification/OpenSearch.openapi', scrubber.doc, 'yaml');
}

start().then(r => console.log('done'));