import csv2json from 'csvtojson';
import { createReadStream, createWriteStream } from 'fs';



function go(input: string, output: string) {
    const readStream = createReadStream(`./data/2-csv/${input}`);
    const writeStream = createWriteStream(`./data/3-jsonraw/${output}`, { encoding: 'utf-8' });
    readStream.pipe(csv2json({ output: 'json' })).pipe(writeStream);
}

//go('Rooms.txt', 'Rooms.json');    // DONE
//go('Textblocks.txt', 'Textblocks.json'); //DONE
go('Actions.txt', 'Actions.json');
go('Classes.txt', 'Classes.json');
go('Items.txt', 'Items.json');
go('Messages.txt', 'Messages.json');
go('Monsters.txt', 'Monsters.json');
go('Races.txt', 'Races.json');
go('Shops.txt', 'Shops.json');
go('Spells.txt', 'Spells.json');
