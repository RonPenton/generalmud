import fs from 'fs';
import path from 'path';

function loadCommands() {

    const location = __dirname;

    const files = fs.readdirSync(location).map(name => {
        const fp = path.join(location, name);
        return { fp, name, stat: fs.statSync(fp) };
    });

    const fileTest = /(.*)\.[jt]sx?/;

    const ts = files.filter(x => !x.stat.isDirectory())
                .filter(x => fileTest.test(x.name))
                .filter(x => !x.name.startsWith('index.') && !x.name.startsWith('base.'))
                .map(x => x.fp);

    ts.forEach(x => require(x));
}

loadCommands();