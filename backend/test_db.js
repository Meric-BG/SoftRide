const supabase = require('./src/config/supabase');

async function testConnection() {
    console.log('Testing Supabase Connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Connection Failed:', error.message);
    } else {
        console.log('✅ Connection Successful! Users table exists.');
    }
}

testConnection();
