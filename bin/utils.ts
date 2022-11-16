export function getRoomId(mapNumber: number, roomNumber: number) {
    const str = `${mapNumber}${roomNumber.toString().padStart(4, '0')}`;
    return parseInt(str);
}

export function getMapRoom(roomid: number) {
    const map = Math.floor(roomid / 10000);
    const room = roomid - (map * 10000);
    return { map, room }
}
