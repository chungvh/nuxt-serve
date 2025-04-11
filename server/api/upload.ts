import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

const config = useRuntimeConfig()

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
})

// Chuyển buffer thành ReadableStream
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
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded'
        })
    }

    // Upload stream to Cloudinary
    return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'hotel-rooms' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary error:', error)
                    reject(createError({ statusCode: 500, statusMessage: 'Upload failed' }))
                } else {
                    resolve({ url: result.secure_url })
                }
            }
        )
        bufferToStream(file.data as Buffer).pipe(stream)
    })
})
