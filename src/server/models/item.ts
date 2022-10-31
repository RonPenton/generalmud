import Decimal from "decimal.js";
import { ProxyObject } from "../db/generic";

export type ItemStorage = {
    id: number;
    name: string;
    desc: string;
    cost: Decimal;
    room?: number;
    actor?: number;
    properties: ItemProperties;
}

export interface ItemProperties {

}

export type Item = ProxyObject<'items'>;

