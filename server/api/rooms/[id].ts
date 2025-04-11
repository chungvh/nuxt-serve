import { getRooms, saveRooms } from '../../utils/roomStore'
import { v2 as cloudinary } from 'cloudinary'

const config = useRuntimeConfig()

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
})

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

        // 🔥 Đây là đoạn bạn hỏi:
        if (oldImage !== newImage && oldImage?.includes('res.cloudinary.com')) {
            const match = oldImage.match(/\/hotel-rooms\/([^/.]+)/)
            const publicId = match?.[1]
            if (publicId) {
                await cloudinary.uploader.destroy(`hotel-rooms/${publicId}`)
                console.log(`Đã xóa ảnh Cloudinary: hotel-rooms/${publicId}`)
            }
        }

        // ✅ Cập nhật dữ liệu phòng
        rooms[index] = { ...rooms[index], ...body }
        await saveRooms(rooms)
        return { message: `Đã cập nhật phòng ${id}`, data: rooms[index] }
    }

    throw createError({ statusCode: 405 })
})
