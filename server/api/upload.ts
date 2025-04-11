import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

const config = useRuntimeConfig()

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
})

function bufferToStream(buffer: Buffer) {
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    return readable
}

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)
    const file = formData?.find(f => f.name === 'file')

    if (!file || !file.data) {
        throw createError({ statusCode: 400, statusMessage: 'Không có file' })
    }

    const uploadStream = cloudinary.uploader.upload_stream()

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'hotel-rooms' }, // Tạo thư mục "hotel-rooms" trong Cloudinary
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error)
                    reject(createError({ statusCode: 500, statusMessage: 'Upload thất bại' }))
                } else {
                    resolve({ url: result.secure_url })
                }
            }
        ).end(file.data)
    })
})
