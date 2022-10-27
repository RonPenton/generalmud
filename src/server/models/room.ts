import { PartialRecord } from "tsc-utils";
import { Direction } from "./direction";
import { ExitData } from "./exit";
import { Actor } from "./actor";
import { Item } from "./item";
import { Wallet } from "./wallet";

export type RoomExits = PartialRecord<Direction, ExitData>;

export interface Room {
    id: number;
    name: string;
    desc: string;
    light: number;
    exits: RoomExits;
    actors: Map<number, Actor>;
    items: Map<number, Item>;
    money: Wallet;
    hiddenMoney: Wallet;
}
