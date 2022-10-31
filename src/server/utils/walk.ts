import Decimal from "decimal.js";

export type WalkerKey = string | number;

export type Walker = (base: any, key: string | number, value: any, stack: WalkerKey[]) => void;

export function walk(obj: any, walker: Walker, stack: WalkerKey[] = []) {
    if (Array.isArray(obj)) {
        obj.forEach((val, key) => {
            walker(obj, key, val, stack)
            walk(val, walker, [...stack, key]);
        });
    }
    else if (obj instanceof Date) {
        return;
    }
    else if(obj instanceof Decimal) {
        return;
    }
    else if(typeof obj === 'object') {
        for(const key in obj) {
            walker(obj, key, obj[key], stack);
            walk(obj[key], walker, [...stack, key]);
        }
    }
}