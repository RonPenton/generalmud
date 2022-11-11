// This file cleans up the JSON a bit. 

import fs from 'fs';
import { readLines } from "./readline";

async function convertProperties(input: string, output: string) {
    const out = fs.createWriteStream(output, { encoding: 'utf-8' });

    const writeLine = async (line: string) => {
        return new Promise(resolve => {
            out.write(line + '\n', resolve);
        });
    }

    await readLines(input, async line => {

        const obj = JSON.parse(line);
        let newObj: any = {};
        for (const key of Object.keys(obj)) {
            const newKey = key.replace(/\s/g, '');
            const val = obj[key];
            const test = (+val);
            if (isNaN(test) || val == '') {
                newObj[newKey] = obj[key];
            }
            else {
                newObj[newKey] = parseInt(val);
            }
        }
        await writeLine(JSON.stringify(newObj));
        return Promise.resolve();
    });

    out.close();
}

void convertProperties('./data/3-jsonraw/Rooms.json', './data/4-json/Rooms.json');
