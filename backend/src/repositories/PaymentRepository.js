const supabase = require('../config/supabase');

// In-memory store for POC fallback persistence
const paymentsFallbackStore = [];

class PaymentRepository {
    async create(payment) {
        const { data, error } = await supabase
            .from('payments')
            .insert([payment])
            .select()
            .single();

        if (error) {
            console.error('Error creating payment:', error);
            // Fallback for POC if table doesn't exist or RLS issue
            console.warn('⚠️ Supabase Payment issue. Using fallback for POC.');
            const fallbackPayment = {
                ...payment,
                payment_id: payment.payment_id || 'sim-' + Date.now(),
                created_at: payment.created_at || new Date().toISOString()
            };
            paymentsFallbackStore.push(fallbackPayment);
            return fallbackPayment;
        }
        return data;
    }

    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from('payments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('payment_id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating payment status:', error);
            const index = paymentsFallbackStore.findIndex(p => p.payment_id === id);
            if (index !== -1) {
                paymentsFallbackStore[index].status = status;
                paymentsFallbackStore[index].updated_at = new Date().toISOString();
                return paymentsFallbackStore[index];
            }
            return { payment_id: id, status, updated_at: new Date().toISOString() };
        }
        return data;
    }

    async findByUser(userId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payments:', error);
            // Return filtered fallback store
            return paymentsFallbackStore
                .filter(p => p.user_id === userId)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return (data || []).concat(paymentsFallbackStore.filter(p => p.user_id === userId));
    }
}

module.exports = new PaymentRepository();
