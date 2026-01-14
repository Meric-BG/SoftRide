/**
 * MTN Mobile Money API Service for Benin
 * Documentation: https://momodeveloper.mtn.com/
 */

const axios = require('axios');

class MTNMoMoService {
    constructor() {
        this.apiKey = process.env.MTN_MOMO_API_KEY;
        this.apiUser = process.env.MTN_MOMO_API_USER;
        this.subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
        this.environment = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
        this.callbackUrl = process.env.MTN_MOMO_CALLBACK_URL || 'http://localhost:5000/api/payments/momo/callback';

        // Check if we are in mock mode (using test credentials)
        this.mockMode = this.apiKey === 'test-api-key' || process.env.MTN_MOMO_MOCK_MODE === 'true';

        this.baseUrl = this.environment === 'sandbox'
            ? 'https://sandbox.momodeveloper.mtn.com'
            : 'https://momodeveloper.mtn.com';

        this.accessToken = null;
        this.tokenExpiry = 0;

        if (this.mockMode) {
            console.log('⚠️ MTN MoMo Service running in MOCK MODE');
        }
    }

    /**
     * Get OAuth2 access token
     */
    async getAccessToken() {
        if (this.mockMode) {
            return 'mock-access-token';
        }

        // Check if token is still valid
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');

            const response = await axios.post(
                `${this.baseUrl}/collection/token/`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    },
                }
            );

            this.accessToken = response.data.access_token;
            // Token expires in 3600 seconds, refresh 5 minutes before
            this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

            return this.accessToken;
        } catch (error) {
            console.error('MTN MoMo token error:', error.response?.data || error.message);
            throw new Error('Failed to get MTN MoMo access token');
        }
    }

    /**
     * Request payment from customer
     */
    async requestToPay(payment) {
        const referenceId = this.generateUUID();

        if (this.mockMode) {
            console.log(`[MOCK] Requesting payment for ${payment.amount} ${payment.currency} from ${payment.payer.partyId}`);
            // Simulate API latency
            await new Promise(resolve => setTimeout(resolve, 1000));
            return referenceId;
        }

        const token = await this.getAccessToken();

        try {
            await axios.post(
                `${this.baseUrl}/collection/v1_0/requesttopay`,
                payment,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Reference-Id': referenceId,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return referenceId;
        } catch (error) {
            console.error('MTN MoMo payment request error:', error.response?.data || error.message);
            throw new Error('Payment request failed');
        }
    }

    /**
     * Check payment status
     */
    async getPaymentStatus(referenceId) {
        if (this.mockMode) {
            // Simulate user interaction delay
            // The status will be PENDING for the first 10 seconds, then SUCCESSFUL
            // We use the referenceId timestamp to determine how much time has passed
            // For mock purposes, we assume referenceId was created recently. 
            // Since we don't store the creation time in memory, we can use a trick:
            // In a real scenario, we would check the transaction creation time in DB. 
            // But here, let's just use a simple randomized simulation or check the transaction ID if possible.
            // Simplified approach: Randomly return PENDING or SUCCESSFUL based on time? 
            // Better approach: Since the frontend polls every 3 seconds, let's make it SUCCESSFUL
            // only if the seconds part of current time is > 30? No, that's erratic.

            // Let's rely on the DB transaction creation time which is passed via referenceId? No.
            // Let's just simulate a delay using a simple in-memory map for mock transactions?

            if (!this.mockTransactions) {
                this.mockTransactions = new Map();
            }

            let mockTx = this.mockTransactions.get(referenceId);
            if (!mockTx) {
                // First time checking this ID, register it
                mockTx = { startTime: Date.now() };
                this.mockTransactions.set(referenceId, mockTx);
            }

            const elapsed = Date.now() - mockTx.startTime;
            const CONFIRMATION_DELAY_MS = 10000; // 10 seconds to simulate user typing PIN

            if (elapsed < CONFIRMATION_DELAY_MS) {
                return {
                    status: 'PENDING',
                    externalId: referenceId,
                    amount: '5000',
                    currency: 'XOF',
                    payer: { partyIdType: 'MSISDN', partyId: '2290197000001' }
                };
            } else {
                return {
                    status: 'SUCCESSFUL',
                    externalId: referenceId,
                    financialTransactionId: 'MOCK_FIN_ID_' + Math.floor(Math.random() * 100000),
                    amount: '5000',
                    currency: 'XOF',
                    payer: { partyIdType: 'MSISDN', partyId: '2290197000001' }
                };
            }
        }

        const token = await this.getAccessToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('MTN MoMo status check error:', error.response?.data || error.message);
            throw new Error('Failed to get payment status');
        }
    }

    /**
     * Validate account holder (check if phone number is registered)
     */
    async validateAccountHolder(phoneNumber) {
        if (this.mockMode) {
            // Simulate validation (succeed for everything except specific test number)
            // Test number for failure: +229 01 97 00 00 10
            return !phoneNumber.endsWith('97000010');
        }

        const token = await this.getAccessToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    },
                }
            );

            return response.data.result === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get account balance
     */
    async getBalance() {
        if (this.mockMode) {
            return { availableBalance: '1000000', currency: 'XOF' };
        }
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/account/balance`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('MTN MoMo balance error:', error.response?.data || error.message);
            throw new Error('Failed to get balance');
        }
    }

    /**
     * Generate UUID v4
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Format phone number for Benin
     * Supports old 8-digit and new 10-digit (01 prefix) formats
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-numeric characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Handle different formats
        if (cleaned.startsWith('229')) {
            return cleaned; // Already has country code
        } else if (cleaned.length === 10 && cleaned.startsWith('01')) {
            return '229' + cleaned; // Add country code to 10-digit number
        } else if (cleaned.length === 8) {
            // Convert old 8-digit to new 10-digit by adding 01? 
            // Or just verify if 8 digits are still supported by API?
            // Assuming API expects 229 + number.
            // If the user inputs 8 digits, we might want to assume it's the old format 
            // but for safety, let's just prepend 229. 
            // However, the USER said "now have this format: +229 01 XX...", 
            // so we should probably encourage 10 digits or auto-prefix 01 if missing?
            // Let's stick to standard normalization first: Country Code + Number
            return '229' + cleaned;
        } else if (cleaned.startsWith('00229')) {
            return cleaned.substring(2); // Remove 00
        }

        return cleaned;
    }

    /**
     * Validate Benin phone number
     * Supports 8 digits (old) and 10 digits (new, starting with 01)
     */
    validateBeninPhoneNumber(phoneNumber) {
        // Remove spaces and + for validation check
        const cleaned = phoneNumber.replace(/[\s+]/g, '');

        // Regex for:
        // 1. +229 followed by 8 digits (old) or 10 digits (new)
        // 2. 00229 followed by ...
        // 3. 229 followed by ...
        // 4. Just 8 digits
        // 5. Just 10 digits (starting with 01)

        // Simplified Logic: Check if it normalizes to a valid length
        const formatted = this.formatPhoneNumber(cleaned);

        // Expected length with 229 prefix:
        // 229 + 8 digits = 11 digits
        // 229 + 10 digits = 13 digits

        return formatted.length === 11 || formatted.length === 13;
    }
}

// Singleton instance
let momoService = null;

function getMoMoService() {
    if (!momoService) {
        momoService = new MTNMoMoService();
    }
    return momoService;
}

module.exports = { MTNMoMoService, getMoMoService };
