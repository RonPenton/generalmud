import { Db } from "../db";
import { Socket } from "socket.io";
import { MessageName, MessagePacket, MessageTypes } from "../messages";
import { isAfter } from 'date-fns';
import { executeCommand } from "../commands/base";
import { Room } from "../models/room";
import { dbCreateObject } from "../db/generic";
import { ProxyObject, SetupLinkSets, Table, Tables, TableType, UnderlyingObject } from '../db/types';
import { Actor, ActorStorage, findActorMatch, getActorReference, getCanonicalName, getPlayerReference, isPlayer, PlayerActor, PlayerData } from "../models/actor";
import { SansId } from "../models/sansId";
import { getEnv } from "../environment";
import { filterIterable, mapIterable } from "tsc-utils";
import { Direction } from "../models/direction";
import { saveDbObject } from "../db/load";
import { MovementCommand, MovementManager, movementManager } from "./movement";
import { getProxyObject } from "../utils/tableProxy";
import { startTimer, Time } from "./time";

const env = getEnv();

export type TableArrays = {
    [K in Table]: TableType<K>[];
}

export type ProxyMap = {
    [K in Table]: Map<number, ProxyObject<K>>
}

export class World {

    constructor(
        private readonly db: Db,
        tableArrays: TableArrays
    ) {

        // create proxies for every object. 
        this.proxyMap = Tables.reduce<ProxyMap>((acc, t) => {
            acc[t] = new Map(tableArrays[t].map(x => [x.id, getProxyObject(t, this, x)])) as any;
            return acc;
        }, {} as ProxyMap);

        // now that all objects are loaded we can stitch everything together in memory. 
        Tables.flatMap(x => this.proxyMap[x]).flatMap(x => [...x.values()]).forEach(x => x[SetupLinkSets]());


        const players = filterIterable(this.proxyMap.actors.values(), isPlayer);
        this.players = new Map(mapIterable(players, x => [x.playerData.uniqueName, x]));

        setInterval(() => {
            void this.saveDirtyRecords();
        }, 10000);

        this.worldStorage = this.get('worlds', 1);
        this.timer = startTimer(this.worldStorage);
        this.movement = movementManager(this.onMove.bind(this), this.timer);
    }

    private worldStorage: ProxyObject<'worlds'>;
    public timer: Time;

    proxyMap: ProxyMap;

    public get<T extends Table>(table: T, id: number): ProxyObject<T> {
        const item = this.proxyMap[table].get(id);
        if (!item) {
            throw new Error(`Cannot find ${table}: ${id}`);
        }
        return item;
    }

    public getRoom = (id: number) => this.get('rooms', id);
    public getItem = (id: number) => this.get('items', id);
    public getActor = (id: number) => this.get('actors', id);

    private activePlayers = new Map<string, PlayerActor>();
    private players: Map<string, PlayerActor>;
    private playerSockets = new Map<string, Socket>();

    private dirtyRecords = new Map<string, { table: Table, id: number }>();
    public setDirty(table: Table, id: number) {
        this.dirtyRecords.set(`${table}::${id}`, { table, id });
    }
    private async saveDirtyRecords() {
        if (this.dirtyRecords.size == 0) {
            return;
        }

        // update the world time and save it.
        this.worldStorage.time = this.timer.getTime();
        await saveDbObject(this.db, 'worlds', this.worldStorage[UnderlyingObject]);

        const vals = this.dirtyRecords;
        this.dirtyRecords = new Map();

        const start = Date.now();
        for (const val of vals.values()) {
            const obj = this.get(val.table, val.id);
            await saveDbObject(this.db, val.table, obj[UnderlyingObject]);
        }
        const end = Date.now();
        console.log(`Saved ${vals.size} records in ${end - start}ms`);
    }

    public getActivePlayers(): Iterable<PlayerActor> { return this.activePlayers.values(); }
    public getPlayer(name: string) { return this.players.get(getCanonicalName(name)); }
    //public getCommands(): Iterable<Command> { return this.commands }

    private onMove(command: MovementCommand) {

        const { actor, direction, from } = command;

        if (actor.room.id != from.id) {
            // user is somehow in a different room than the one in which the 
            // command was initially issued. 
            if (isPlayer(actor)) {
                this.sendToPlayer(actor, 'error', { text: 'You\'ve become disoriented and have stopped trying to move.' });
            }
            return;
        }

        this.move(actor, direction, 'now');
    }

    private movement: MovementManager;

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
        this.enteredRoom(player, player.room);

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

    public sendToRoom<T extends MessageName>(target: Room | Actor, type: T, message: MessageTypes[T]): void {
        const room = 'room' in target ? target.room : target;
        const players = filterIterable(room.actors.values(), isPlayer);
        for (const player of players) {
            this.sendToPlayer(player, type, message);
        }
    }

    private async handleMessage<T extends MessageName>(player: PlayerActor, message: MessagePacket<T>) {

        const result = await executeCommand(this, player, message);
        if (!result) {
            console.log(`Error: Cannot execute command: ${JSON.stringify(message)}`);
        }
    }

    public say(actor: Actor, message: string) {
        this.sendToRoom(actor, 'talk-room', { from: getActorReference(actor), message })
    }

    public whisper(player: PlayerActor, targetName: string, message: string) {

        const target = findActorMatch(targetName, Array.from(this.activePlayers.values()));
        if (!target) {
            return this.sendToPlayer(player, 'error', { text: 'There is no player with that name!' });
        }
        if (target.id == player.id) {
            return this.sendToPlayer(player, 'system', { text: 'You mutter to yourself...' });
        }
        this.sendToPlayer(player, 'system', { text: `You whisper to ${target.name}...` });
        this.sendToPlayer(target, 'talk-private', { from: getPlayerReference(player), message });
    }

    public look(player: PlayerActor, message: MessageTypes['look']) {
        // TODO: Add look subjects.
        this.sendRoomDescription(player, message.brief);
    }

    public move(actor: Actor, direction: Direction, type: 'now' | 'queue') {
        const oldRoom = actor.room;
        const exit = oldRoom.exits[direction];
        if (!exit) {
            if (isPlayer(actor)) {
                this.sendToPlayer(actor, 'error', { text: "There is no exit in that direction!" });
            }
            return;
        }

        if (type == 'now') {
            const newRoom = this.getRoom(exit.exitRoom);
            const oldRoom = actor.room;
            this.leftRoom(actor, newRoom, direction);
            actor.room = newRoom;
            this.enteredRoom(actor, oldRoom, direction);
        }
        else {
            const moveTime = 100;
            const result = this.movement.enqueue({
                actor,
                direction,
                due: this.timer.getTime() + moveTime,
                from: oldRoom
            });

            if (!result && isPlayer(actor)) {
                this.sendToPlayer(actor, 'error', { text: 'Hold on there pardner, you\'re already trying to move.' });
            }
        }
    }

    public teleport(actor: Actor, roomId: number) {
        const newRoom = this.getRoom(roomId);
        const oldRoom = actor.room;
        this.leftRoom(actor, newRoom);
        actor.room = newRoom;
        this.enteredRoom(actor, oldRoom);
    }

    private sendRoomDescription(player: PlayerActor, brief?: boolean, room?: Room) {
        const r = room ?? player.room;

        this.sendToPlayer(player, 'room-description',
            {
                id: r.id,
                name: r.name,
                description: brief ? undefined : r.roomDescription.text,
                exits: r.exits,
                actors: [...r.actors.map(getActorReference)],
                inRoom: r.id == player.room.id
            });
    }

    private leftRoom(actor: Actor, other: Room, direction?: Direction) {
        const room = actor.room;
        this.sendToRoom(room, 'actor-moved', { from: getActorReference(actor), entered: false, direction: direction });
        //room.actors.delete(actor);
        room.events.hasLeft({ world: this, actor, room, other });
    }

    private enteredRoom(actor: Actor, other: Room, direction?: Direction) {
        const room = actor.room;

        this.sendToRoom(room, 'actor-moved', { from: getActorReference(actor), entered: true, direction });
        actor.room = room;

        if (isPlayer(actor)) {
            this.sendRoomDescription(actor);
        }

        room.events.hasEntered({ world: this, actor, room, other });
    }

    async createPlayer(playerData: PlayerData, name: string): Promise<PlayerActor> {
        const storage: SansId<ActorStorage> = {
            name,
            playerData,
            wallet: {},
            room: env.STARTING_ROOM
        };

        const actor = (await this.createActor(storage, false)) as PlayerActor;

        this.players.set(playerData.uniqueName, actor);

        return actor;
    }

    async createActor(actor: SansId<ActorStorage>, online = true): Promise<Actor> {

        const storage = await dbCreateObject(this.db, 'actors', actor);
        const proxy = getProxyObject('actors', this, storage);

        this.proxyMap.actors.set(proxy.id, proxy);

        if (online) {
            const room = this.getRoom(actor.room);
            proxy.room = room;
            //room.actors.add(proxy);
            //TODO: Message about actor entering room here.
        }

        return proxy;
    }
}
