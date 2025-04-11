import { getRooms, saveRooms } from '../../utils/roomStore'
import { unlink } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    let rooms = await getRooms()

    const index = rooms.findIndex(r => r.id === id)
    if (index === -1) {
        throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy phòng' })
    }

    if (event.method === 'PUT') {
        const body = await readBody(event)
        const oldImage = rooms[index].image
        const newImage = body.image

        // Nếu ảnh mới khác ảnh cũ và ảnh cũ là ảnh local, thì xóa
        if (oldImage && newImage && oldImage !== newImage && oldImage.startsWith('/uploads/')) {
            const filePath = join(process.cwd(), 'public', oldImage)
            try {
                await unlink(filePath)
                console.log(`Đã xóa ảnh cũ: ${filePath}`)
            } catch (err) {
                console.warn(`Không thể xóa ảnh: ${filePath}`, err)
            }
        }

        rooms[index] = { ...rooms[index], ...body }
        await saveRooms(rooms)
        return { message: `Đã cập nhật phòng ${id}`, data: rooms[index] }
    }

    if (event.method === 'DELETE') {
        // (Bạn có thể xử lý xóa ảnh tại đây luôn nếu muốn)
        const room = rooms.find(r => r.id === id)
        if (room?.image?.startsWith('/uploads/')) {
            const filePath = join(process.cwd(), 'public', room.image)
            try {
                await unlink(filePath)
                console.log(`Đã xóa ảnh kèm theo khi xóa phòng: ${filePath}`)
            } catch (err) {
                console.warn(`Không thể xóa ảnh: ${filePath}`, err)
            }
        }

        rooms = rooms.filter(r => r.id !== id)
        await saveRooms(rooms)
        return { message: `Đã xóa phòng ${id}` }
    }

    throw createError({ statusCode: 405 })
})
