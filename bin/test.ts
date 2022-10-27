import Decimal from 'decimal.js';

let foo = {
    str: "test",
    int: 42,
    map: new Map<string, string>([["a", "A"], ["b", "B"]])
};

console.log(foo.map instanceof Map);

function wrapObject<T extends Record<string, any>>(obj: T): T {
    const keys: (Extract<keyof T, string>)[] = Object.keys(obj) as any;
    const output = keys.reduce<T>((acc, key) => {

        const prop = obj[key];
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if(prop && desc && isPrimitive(prop)) {
            Object.defineProperty(acc, key, {
                get() {
                    console.log(`Getting ${key}: «${desc.value}»`);
                    return desc.value;
                },

                set(value) {
                    console.log(`Setting ${key} to: «${value}»`);
                    desc.value = value;
                }
            });
        }
        else if()
        else {
            acc[key] = prop;
        }
        return acc;
    }, {} as any);

    return output;
}

const wrap = wrapObject(foo);


wrap.int = 10;
wrap.str = "wtf";
wrap.map.set("c", "C");

console.log(wrap.int);
console.log(wrap.str);
console.log(wrap.map.entries());


export function isPrimitive(o: any) {
    const type = typeof o;
    return type === 'string' || type == 'boolean' || type == 'number' || o instanceof Decimal;
}



