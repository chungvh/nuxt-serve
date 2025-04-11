import { getSupabase } from '../utils/supabase'
import { randomUUID } from 'crypto'

const supabase = getSupabase()

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)
    const file = formData?.find(f => f.name === 'file')

    if (!file || !file.data) {
        throw createError({ statusCode: 400, statusMessage: 'Không có file để upload' })
    }

    const fileName = `${randomUUID()}_${file.filename}`
    const bucket = 'rooms' // ✅ chính xác theo bucket bạn tạo

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.data, {
            contentType: file.type
        })

    if (error) {
        console.error('[❌ Upload thất bại]', error)
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    // ✅ Trả về public URL
    const { publicUrl } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(fileName).data

    return { url: publicUrl }
})
