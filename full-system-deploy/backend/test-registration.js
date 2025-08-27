const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
};

async function testUserRegistration() {
    console.log('🧪 Testing Database-Backed User Registration...\n');

    try {
        // Test 1: Register a new user
        console.log('1. Testing user registration...');
        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
        
        if (registerResponse.data.success) {
            console.log('✅ User registration successful!');
            console.log('   Response:', registerResponse.data);
        } else {
            console.log('❌ User registration failed!');
            console.log('   Error:', registerResponse.data);
            return;
        }

        // Test 2: Try to register the same user again (should fail)
        console.log('\n2. Testing duplicate user registration...');
        try {
            const duplicateResponse = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
            console.log('❌ Duplicate registration should have failed!');
            console.log('   Response:', duplicateResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 500) {
                console.log('✅ Duplicate registration correctly rejected!');
                console.log('   Error:', error.response.data.error);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        // Test 3: Login with the registered user
        console.log('\n3. Testing user login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: TEST_USER.username,
            password: TEST_USER.password
        });

        if (loginResponse.data.success) {
            console.log('✅ User login successful!');
            console.log('   Token received:', !!loginResponse.data.token);
            console.log('   User data:', {
                username: loginResponse.data.user.username,
                email: loginResponse.data.user.email,
                role: loginResponse.data.user.role
            });
        } else {
            console.log('❌ User login failed!');
            console.log('   Error:', loginResponse.data);
        }

        // Test 4: Test invalid login
        console.log('\n4. Testing invalid login...');
        try {
            const invalidLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
                username: TEST_USER.username,
                password: 'wrongpassword'
            });
            console.log('❌ Invalid login should have failed!');
            console.log('   Response:', invalidLoginResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 500) {
                console.log('✅ Invalid login correctly rejected!');
                console.log('   Error:', error.response.data.error);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run the test
testUserRegistration();
