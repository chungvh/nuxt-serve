import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
    const supabase = getSupabase()

    if (event.method === 'GET') {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .order('id', { ascending: false })

        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        return data
    }

    if (event.method === 'POST') {
        const body = await readBody(event)
        const { data, error } = await supabase.from('rooms').insert([body]).select()
        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        return { message: 'Đã thêm phòng', data: data?.[0] }
    }

    throw createError({ statusCode: 405 })
})
