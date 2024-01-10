import Mustache from 'mustache';
import fs from 'fs';
import path from 'path';

export default class BaseRenderer {
    protected templateFile: string = '';

    constructor(..._args: any[]) {

    }

    static render(...args: any[]): string {
        return new this(...args).render();
    }

    static generateFile(rootDir: string, ...args: any[]): void {
        new this(...args).generateFile(rootDir);
    }

    view(): Record<string, any> {
        throw 'Not implemented';
    }

    render(): string {
        const templatePath = path.join(__dirname, './templates', this.templateFile);
        const template = fs.readFileSync(templatePath, 'utf8');
        return Mustache.render(template, {...this.#commons(), ...this.view()});
    }

    outputPath(rootDir: string): string {
        throw 'Not implemented';
    }

    generateFile(rootDir: string): void {
        fs.writeFileSync(this.outputPath(rootDir), this.render());
    }

    #commons(): Record<string, any> {
        return {
            opensearch_license:
`// SPDX-License-Identifier: Apache-2.0
//
//  The OpenSearch Contributors require contributions made to
//  this file be licensed under the Apache-2.0 license or a
//  compatible open source license.
`,
        }
    }
}