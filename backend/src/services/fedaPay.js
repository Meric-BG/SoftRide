const { FedaPay, Transaction } = require('fedapay');

class FedaPayService {
    constructor() {
        this.apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_1234567890'; // Default for testing
        this.environment = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

        // Configure FedaPay
        FedaPay.setApiKey(this.apiKey);
        FedaPay.setEnvironment(this.environment);
    }

    /**
     * Create a transaction and generate payment URL
     * @param {Object} data Transaction data
     * @returns {Promise<Object>} Token and URL
     */
    async createTransaction(data) {
        try {
            const transaction = await Transaction.create({
                description: data.description,
                amount: data.amount,
                currency: { code: data.currency || 'XOF' },
                callback_url: data.callbackUrl || process.env.FEDAPAY_CALLBACK_URL,
                customer: {
                    firstname: data.customer.firstname || 'Client',
                    lastname: data.customer.lastname || 'Kemet',
                    email: data.customer.email,
                    phone_number: {
                        number: data.customer.phoneNumber,
                        country: 'bj' // Benin by default
                    }
                }
            });

            const token = await transaction.generateToken();

            return {
                token: token.token,
                url: token.url,
                transactionId: transaction.id
            };
        } catch (error) {
            console.error('FedaPay transaction error:', error);
            throw new Error('Failed to create FedaPay transaction: ' + error.message);
        }
    }

    /**
     * Verify transaction status
     * @param {string|number} transactionId 
     */
    async verifyTransaction(transactionId) {
        try {
            const transaction = await Transaction.retrieve(transactionId);
            return transaction;
        } catch (error) {
            console.error('FedaPay verify error:', error);
            throw new Error('Failed to verify FedaPay transaction');
        }
    }
}

// Singleton instance
let fedaPayService = null;

function getFedaPayService() {
    if (!fedaPayService) {
        fedaPayService = new FedaPayService();
    }
    return fedaPayService;
}

module.exports = { FedaPayService, getFedaPayService };
