import MissingDefaultsFinder from "./src/restore_defaults/MissingDefaultsFinder";
import fs from "fs";
import YAML from "yaml";
import {OpenAPIV3} from "openapi-types";

const origin = JSON.parse(fs.readFileSync('./specs/OpenSearch.openapi.json', 'utf8')) as OpenAPIV3.Document;
const target = YAML.parse(fs.readFileSync('./specs/opensearch-openapi.yaml', 'utf8')) as OpenAPIV3.Document;
const finder = new MissingDefaultsFinder(origin, target);
console.log(finder.find());