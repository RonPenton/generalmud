async function go() {
    const mod = await import('./module');
    let val = mod.execute();
    console.log(val);

    console.log('Enter Text: ');
    await readInput();

    delete require.cache[require.resolve(`./module.ts`)]

    const mod2 = await import('./module');
    val = mod2.execute();
    console.log(val);
}


export function readInput() {
    return new Promise((resolve) => {
        let stdin = process.openStdin();

        const dataFunc = function (d: any) {
            resolve(d.toString().trim());
        };

        stdin.addListener("data", dataFunc);
    });
}

void go();
