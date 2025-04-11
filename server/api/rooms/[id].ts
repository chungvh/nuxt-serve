import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))

    if (event.method === 'PUT') {
        const body = await readBody(event)

        const { data, error } = await getSupabase()
            .from('rooms')
            .update(body)
            .eq('id', id)
            .select()

        if (error) {
            console.error('Supabase UPDATE error:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        return {
            message: `Đã cập nhật phòng ID ${id}`,
            data: data?.[0]
        }
    }

    if (event.method === 'DELETE') {
        const { error } = await getSupabase()
            .from('rooms')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase DELETE error:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        return { message: `Đã xóa phòng ID ${id}` }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
