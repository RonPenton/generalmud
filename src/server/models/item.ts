import Decimal from "decimal.js";

export type Item = {
    id: number;
    name: string;
    desc: string;
    cost: Decimal;
    room?: number;
    actor?: number;
} & InRoomOrOnActor;

export type InRoom = {
    room: number;
    actor?: never;
}

export type OnActor = {
    actor: number;
}

export type InRoomOrOnActor = InRoom | OnActor;


const i: Item = {
    id: 1,
    name: "sword",
    desc: "This be a sword",
    cost: new Decimal(1000),
    actor: 100
};

const j: Item = i as any as Item;

j.room = 100;
