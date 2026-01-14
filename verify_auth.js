const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const testData = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
    brand: 'Kemet',
    model: 'SDV-1'
};

async function testFlow() {
    console.log('--- Starting Verification Flow ---');

    try {
        // 1. Register
        console.log('\n1. Registering new user...');
        const regRes = await axios.post(`${API_URL}/auth/register`, testData);
        console.log('✅ Registration Successful');
        console.log('User ID:', regRes.data.user.id);
        console.log('Generated VIN:', regRes.data.user.vin);
        const token = regRes.data.token;

        // 2. Login
        console.log('\n2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testData.email,
            password: testData.password
        });
        console.log('✅ Login Successful');

        // 3. Get Me
        console.log('\n3. Getting current user info...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Get Me Successful');
        console.log('User Name:', meRes.data.name);
        console.log('Vehicle Brand:', meRes.data.vehicles?.brand_name);
        console.log('Vehicle VIN:', meRes.data.vehicles?.vin);

        if (meRes.data.vehicles?.vin === regRes.data.user.vin) {
            console.log('\n🎉 ALL TESTS PASSED!');
        } else {
            console.error('\n❌ VIN mismatch detected!');
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error.response?.data || error.message);
    }
}

testFlow();
