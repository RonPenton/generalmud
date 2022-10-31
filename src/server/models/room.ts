import { PartialRecord } from "tsc-utils";
import { ProxyObject } from "../db/generic";
import { Direction } from "./direction";
import { ExitData } from "./exit";
import { Wallet } from "./wallet";

export type RoomExits = PartialRecord<Direction, ExitData>;

export interface RoomStorage {
    id: number;
    name: string;
    description: number;
    light: number;
    exits: RoomExits;
    actors: number[];
    items: number[];
    money: Wallet;
    hiddenMoney: Wallet;
}

export type Room = ProxyObject<'rooms'>;
