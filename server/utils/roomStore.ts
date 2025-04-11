// server/utils/roomStore.ts

import fsExtra from 'fs-extra'
const filePath = 'data/rooms.json'

export async function getRooms() {
    try {
        return await fsExtra.readJSON(filePath)
    } catch {
        return []
    }
}

export async function saveRooms(rooms: any) {
    await fsExtra.writeJSON(filePath, rooms, { spaces: 2 })
}
