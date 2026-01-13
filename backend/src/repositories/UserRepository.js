const supabase = require('../config/supabase');

class UserRepository {

    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', id) // Check if your DB uses user_id or id
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async create(user) {
        const { data, error } = await supabase
            .from('users')
            .insert([user])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new UserRepository();
