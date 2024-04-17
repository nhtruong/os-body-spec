import fs from "fs";
import YAML from "yaml";

export default class SpecFile {
    spec: Record<string, any>
    path: string

    constructor(path: string) {
        this.path = path
        this.spec = YAML.parse(fs.readFileSync(path, 'utf8'))
    }

     write(): void {
        fs.writeFileSync(this.path,
            this.#quoteRefs(YAML.stringify(
                this.#removeAnchors(this.spec), {lineWidth: 0, singleQuote: true})));
    }

    #quoteRefs(str: string): string {
        return str.split('\n').map((line) => {
            if(line.includes('$ref')) {
                const [key, value] = line.split(': ');
                if(!value.startsWith("'")) line = `${key}: '${value}'`;
            }
            return line
        }).join('\n');
    }

    #removeAnchors(content: Record<string, any>): Record<string, any> {
        const replacer = (key: string, value: any) => key === '$anchor' ? undefined : value;
        return JSON.parse(JSON.stringify(content, replacer));
    }
}