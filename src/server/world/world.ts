import { Db } from "../db";
import { Socket } from "socket.io";
import { MessageName, MessagePacket, MessageTypes } from "../messages";
import { isAfter } from 'date-fns';
import { executeCommand } from "../commands/base";
import { Room } from "../models/room";
import { dbCreateObject, fromStorage, Storage } from "../db/generic";
import { Actor, getActorReference, getCanonicalName, getPlayerReference, isPlayer, PlayerActor, PlayerData } from "../models/actor";
import { Item } from "../models/item";
import { SansId } from "../models/sansId";
import { getEnv } from "../environment";
import { filterIterable, mapIterable } from "tsc-utils";
import { Direction } from "../models/direction";
import { pagedLoad } from "../db/load";
import { MovementCommand, movementManager } from "./movement";

const env = getEnv();

export function createGetFromMap<K, T>(type: string, map: Map<K, T>) {
    return (id: K): T => {
        const item = map.get(id);
        if (!item) {
            throw new Error(`Cannot find ${type}: ${id}`);
        }
        return item;
    }
}

export type MapGet<K, T> = (id: K) => T;

export class World {


    static async load(db: Db): Promise<World> {
        const items = await pagedLoad(db, 'items', {});
        const actors = await pagedLoad(db, 'actors', { items });
        const rooms = await pagedLoad(db, 'rooms', { actors, items });

        //const commands = await World.loadCommands();

        return new World(db, items, actors, rooms);
    }

    private constructor(
        private readonly db: Db,
        public readonly items: Map<number, Item>,
        public readonly actors: Map<number, Actor>,
        public readonly rooms: Map<number, Room>,
        // private readonly commands: Command[]) 
    ) {

        const players = filterIterable(actors.values(), isPlayer);
        this.players = new Map(mapIterable(players, x => [x.playerData.uniqueName, x]));

        this.getRoom = createGetFromMap('room', this.rooms);
        this.getItem = createGetFromMap('item', this.items);
        this.getActor = createGetFromMap('actor', this.actors);
    }

    public getRoom: MapGet<number, Room>;
    public getItem: MapGet<number, Item>;
    public getActor: MapGet<number, Actor>;

    private activePlayers = new Map<string, PlayerActor>();
    private players: Map<string, PlayerActor>;
    private playerSockets = new Map<string, Socket>();


    public getActivePlayers(): Iterable<PlayerActor> { return this.players.values(); }
    public getPlayer(name: string) { return this.players.get(getCanonicalName(name)); }
    //public getCommands(): Iterable<Command> { return this.commands }

    private onMove(command: MovementCommand) {

        const { actor, direction, from } = command;

        if (actor.room != from.id) {
            // user is somehow in a different room than the one in which the 
            // command was initially issued. 
            if (isPlayer(actor)) {
                this.sendToPlayer(actor, 'error', { text: 'You\'ve become disoriented and have stopped trying to move.' });
            }
            return;
        }

        this.move(actor, direction, 'now');
    }

    private movement = movementManager(this.onMove.bind(this));

    public playerDisconnecting(player: PlayerActor) {
        const active = this.activePlayers.get(player.playerData.uniqueName)
        if (active) {
            this.activePlayers.delete(player.playerData.uniqueName);
            this.playerSockets.delete(player.playerData.uniqueName);
            //this.leaveRoom(Player);
            this.sendToAll('disconnected', { player: getPlayerReference(player) });
        }
    }

    public playerConnecting(player: PlayerActor, socket: Socket) {
        if (this.activePlayers.has(player.playerData.uniqueName)) {
            const oldSocket = this.playerSockets.get(player.playerData.uniqueName);
            this.activePlayers.delete(player.playerData.uniqueName);
            this.playerSockets.delete(player.playerData.uniqueName);
            if (oldSocket) {
                this.sendToPlayer(oldSocket, 'error', { text: "You have been disconnected because a newer connection has logged on." });
                this.sendToPlayer(socket, 'error', { text: "You are already connected in another window... disconnecting the other account..." });
                oldSocket.disconnect(true);
            }
        }

        const now = new Date();

        if (player.playerData.suspendedUntil && isAfter(new Date(player.playerData.suspendedUntil), now)) {
            const reason = player.playerData.suspensionReason || "No reason specified."
            this.sendToPlayer(socket, 'error', { text: `You have been suspended for: ${reason} until ${player.playerData.suspendedUntil.toLocaleString()}` });
            socket.disconnect(true);
            return;
        }

        player.playerData.lastLogin = new Date().toISOString();
        this.activePlayers.set(player.playerData.uniqueName, player);
        this.playerSockets.set(player.playerData.uniqueName, socket);

        this.sendToAll('connected', { player: getPlayerReference(player) });
        this.sendToPlayer(socket, 'system', { text: 'Welcome to GeneralMUD.' });
        this.enteredRoom(player);

        socket.on('message', (message: MessagePacket<any>) => this.handleMessage(player, message));
    }

    public sendToPlayer<T extends MessageName>(playerName: string, type: T, message: MessageTypes[T]): void;
    public sendToPlayer<T extends MessageName>(socket: Socket, type: T, message: MessageTypes[T]): void;
    public sendToPlayer<T extends MessageName>(player: PlayerActor, type: T, message: MessageTypes[T]): void;
    public sendToPlayer<T extends MessageName>(socketOrPlayer: Socket | string | PlayerActor, type: T, message: MessageTypes[T]) {
        const socket = this.getSocket(socketOrPlayer);
        if (socket) {
            const packet: MessagePacket<T> = {
                type,
                time: new Date().valueOf(),
                message
            };
            socket.emit('message', packet);
        }
    }

    private getSocket(x: Socket | string | PlayerActor) {
        if (typeof x === 'string') return this.playerSockets.get(x);
        if ('playerData' in x) return this.playerSockets.get(x.playerData.uniqueName);
        return x;
    }

    public sendToAll<T extends MessageName>(type: T, message: MessageTypes[T]) {
        const Players = this.playerSockets.keys();
        for (let name of Players) {
            this.sendToPlayer(name, type, message);
        }
    }

    private sendToRoom<T extends MessageName>(target: Room | Actor, type: T, message: MessageTypes[T]): void {
        const room = 'room' in target ? this.getRoom(target.room) : target;
        const players = filterIterable(room.actors.values(), isPlayer);
        for (const player of players) {
            this.sendToPlayer(player, type, message);
        }
    }

    private async handleMessage<T extends MessageName>(player: PlayerActor, message: MessagePacket<T>) {

        const result = await executeCommand(this, player, message);
        if (!result) {
            console.log(`Error: Cannot execute command: ${message}`);
        }
    }

    public say(actor: Actor, message: string) {
        this.sendToRoom(actor, 'talk-room', { from: getActorReference(actor), message })
    }

    public whisper(_player: PlayerActor, _targetName: string, _message: string) {
        // const target = findPlayerMatch(targetName, L(this.activePlayers.values()).toArray());
        // if (!target)
        //     return this.sendToPlayer(Player, { type: 'error', message: 'There is no Player with that name!' });
        // if (target.id == Player.id)
        //     return this.sendToPlayer(Player, { type: 'system', message: 'You mutter to yourself...' });
        // this.sendToPlayer(Player, { type: 'system', message: `You whisper to ${target.name}...` });
        // this.sendToPlayer(target, { type: 'talk-private', from: getPlayerReference(Player), message: message });
    }

    public look(player: PlayerActor, message: MessageTypes['look']) {
        // TODO: Add look subjects.
        this.sendRoomDescription(player, message.brief);
    }

    public move(actor: Actor, direction: Direction, type: 'now' | 'queue') {
        const oldRoom = this.getRoom(actor.room);
        const exit = oldRoom.exits[direction];
        if (!exit) {
            if (isPlayer(actor)) {
                this.sendToPlayer(actor, 'error', { text: "There is no exit in that direction!" });
            }
            return;
        }

        if (type == 'now') {
            const newRoom = this.getRoom(exit.exitRoom);
            this.leftRoom(actor, direction);
            actor.room = newRoom.id;
            this.enteredRoom(actor, direction);
        }
        else {
            const moveTime = 100;
            const result = this.movement.enqueue({
                actor,
                direction,
                due: new Date().valueOf() + moveTime,
                from: oldRoom
            });

            if(!result && isPlayer(actor)) {
                this.sendToPlayer(actor, 'error', { text: 'Hold on there pardner, you\'re already trying to move.' });
            }
        }
    }

    private sendRoomDescription(player: PlayerActor, brief?: boolean, room?: Room) {
        const r = room ?? this.getRoom(player.room);

        this.sendToPlayer(player, 'room-description',
            {
                id: r.id,
                name: r.name,
                description: brief ? undefined : r.desc,
                exits: r.exits,
                actors: Array.from(mapIterable(r.actors.values(), getActorReference)),
                inRoom: r.id == player.room
            });
    }

    private leftRoom(actor: Actor, direction?: Direction) {
        const room = this.getRoom(actor.room);
        this.sendToRoom(room, 'actor-moved', { from: getActorReference(actor), entered: false, direction: direction });
        room.actors.delete(actor.id);
    }

    private enteredRoom(actor: Actor, direction?: Direction) {
        const room = this.getRoom(actor.room);

        this.sendToRoom(room, 'actor-moved', { from: getActorReference(actor), entered: true, direction });
        room.actors.set(actor.id, actor);

        if (isPlayer(actor)) {
            this.sendRoomDescription(actor);
        }
    }


    async createPlayer(playerData: PlayerData, name: string): Promise<PlayerActor> {
        const storage: SansId<Storage<Actor>> = {
            name,
            playerData,
            items: [],
            wallet: {},
            room: env.STARTING_ROOM
        };

        const actor = (await this.createActor(storage, false)) as PlayerActor;

        this.players.set(playerData.uniqueName, actor);

        return actor;
    }

    async createActor(actor: SansId<Storage<Actor>>, online = true): Promise<Actor> {

        const storage = await dbCreateObject(this.db, 'actors', actor);
        const converted = fromStorage('actors', this, storage);

        this.actors.set(converted.id, converted);

        if (online) {
            const room = this.getRoom(actor.room);
            room.actors.set(converted.id, converted);
            //TODO: Message about actor entering room here.
        }

        return converted;
    }
}
