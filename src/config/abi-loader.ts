import * as path from 'path';
import * as fs from 'fs';

export function loadAbi(name: string) {
    const abiPath = path.join(__dirname, `../abis/${name}.json`)
    return JSON.parse(fs.readFileSync(abiPath, 'utf-8'))
};
