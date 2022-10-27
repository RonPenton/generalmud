

import * as adodb from "node-adodb";
import * as fs from "fs";

// write to a new file named 2pac.txt

const connection = adodb.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=mmud.mdb;',);

async function toJSON(filename: string, sql: string) {
    try {
        const data = await connection.query(sql);
        const dataString = JSON.stringify(data, null, 2);

        fs.writeFile('data/' + filename, dataString, (err) => {
            if (err) throw err;
            console.log(filename + ' saved!');
        });
    } catch (error) {
        console.log(filename + ' error !');
        console.error(JSON.stringify(error));
    }
}


toJSON('./rooms.json', 'select top 10 * from Rooms');