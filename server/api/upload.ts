import { writeFile } from 'fs/promises'
import { extname } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const form = await readMultipartFormData(event)
    const file = form?.find(f => f.name === 'file')

    if (!file || !file.data) {
        throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const fileName = `${randomUUID()}${extname(file.filename)}`
    const filePath = `public/uploads/${fileName}`
    await writeFile(filePath, file.data)

    return { url: `/uploads/${fileName}` }
})
