import Decimal from "decimal.js";
import { walk } from "./walk";


function deserializeWalker(obj: any, key: string | number, val: any) {
    if (typeof val === 'string' && val.startsWith('decimal://')) {
        obj[key] = new Decimal(val.substring(10));
    }
}

function serializeWalker(obj: any, key: string | number, val: any) {
    if(val instanceof Decimal) {
        obj[key] = `decimal://${val.toString()}`;
    }
}

export function deserializeDecimals(obj: any) {
    walk(obj, deserializeWalker);
}

export function serializeDecimals(obj: any) {
    walk(obj, serializeWalker);
}
