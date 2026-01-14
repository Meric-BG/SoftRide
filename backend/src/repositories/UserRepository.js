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
        // We use explicit join if needed, but vehicles!owner_id(*) is safer if RLS or ambiguity
        const { data, error } = await supabase
            .from('users')
            .select('*, vehicles!owner_id(*)')
            .eq('user_id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error in UserRepository.findById:', error);
            // If the join fails because the relation is not recognized, try without it
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', id)
                .single();
            if (userError) throw userError;
            return userData;
        }
        return data;
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('user_id', id)
            .select()
            .single();

        if (error) throw error;
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
