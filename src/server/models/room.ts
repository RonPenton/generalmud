import { PartialRecord } from "tsc-utils";
import { ProxyObject } from "../db/types";
import { EventDefinition } from "../scripts/base";
import { Direction } from "./direction";
import { ExitData } from "./exit";
import { Wallet } from "./wallet";

export type RoomExits = PartialRecord<Direction, ExitData>;

export interface RoomStorage {
    id: number;
    name: string;
    light: number;
    exits: RoomExits;
    money: Wallet;
    hiddenMoney: Wallet;

    roomDescription: number;

    events?: EventDefinition[];
}

export type Room = ProxyObject<'rooms'>;
