export function getRoomId(mapNumber: number, roomNumber: number) {
    const str = `${mapNumber}${roomNumber.toString().padStart(4, '0')}`;
    return parseInt(str);
}
