import fsExtra from 'fs-extra'
const filePath = 'data/rooms.json'

async function getRooms() {
    try {
        return await fsExtra.readJSON(filePath)
    } catch {
        return []
    }
}
async function saveRooms(rooms: any) {
    await fsExtra.writeJSON(filePath, rooms, { spaces: 2 })
}

export default defineEventHandler(async (event) => {
    if (event.method === 'GET') {
        return await getRooms()
    }

    if (event.method === 'POST') {
        const body = await readBody(event)
        const rooms = await getRooms()
        const newRoom = {
            id: Date.now(),
            ...body,
        }
        rooms.push(newRoom)
        await saveRooms(rooms)
        return { message: 'Đã thêm phòng', data: newRoom }
    }

    throw createError({ statusCode: 405 })
})
