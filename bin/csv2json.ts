import csv2json from 'csvtojson';
import { createReadStream, createWriteStream } from 'fs';

const readStream = createReadStream('./data/2-csv/Rooms.txt');

const writeStream = createWriteStream('./data/3-jsonraw/Rooms.json', { encoding: 'utf-8' });

readStream.pipe(csv2json({ output: 'json'})).pipe(writeStream);
