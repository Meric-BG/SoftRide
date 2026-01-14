/**
 * MTN Mobile Money API Client for Benin
 * Documentation: https://momodeveloper.mtn.com/
 */

interface MoMoConfig {
    apiKey: string;
    apiUser: string;
    subscriptionKey: string;
    environment: 'sandbox' | 'production';
    callbackUrl: string;
}

interface PaymentRequest {
    amount: string;
    currency: string;
    externalId: string;
    payer: {
        partyIdType: 'MSISDN';
        partyId: string; // Phone number
    };
    payerMessage: string;
    payeeNote: string;
}

interface PaymentResponse {
    financialTransactionId?: string;
    externalId: string;
    amount: string;
    currency: string;
    payer: {
        partyIdType: string;
        partyId: string;
    };
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    reason?: string;
}

export class MTNMoMoClient {
    private config: MoMoConfig;
    private baseUrl: string;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(config: MoMoConfig) {
        this.config = config;
        this.baseUrl = config.environment === 'sandbox'
            ? 'https://sandbox.momodeveloper.mtn.com'
            : 'https://momodeveloper.mtn.com';
    }

    /**
     * Get OAuth2 access token
     */
    private async getAccessToken(): Promise<string> {
        // Check if token is still valid
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const response = await fetch(
            `${this.baseUrl}/collection/token/`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.config.apiUser}:${this.config.apiKey}`).toString('base64')}`,
                    'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get access token: ${response.statusText}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        // Token expires in 3600 seconds, refresh 5 minutes before
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        return this.accessToken;
    }

    /**
     * Request payment from customer
     */
    async requestToPay(payment: PaymentRequest): Promise<string> {
        const token = await this.getAccessToken();
        const referenceId = this.generateUUID();

        const response = await fetch(
            `${this.baseUrl}/collection/v1_0/requesttopay`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': referenceId,
                    'X-Target-Environment': this.config.environment,
                    'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payment),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Payment request failed: ${error}`);
        }

        return referenceId;
    }

    /**
     * Check payment status
     */
    async getPaymentStatus(referenceId: string): Promise<PaymentResponse> {
        const token = await this.getAccessToken();

        const response = await fetch(
            `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.config.environment,
                    'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get payment status: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get account balance
     */
    async getBalance(): Promise<{ availableBalance: string; currency: string }> {
        const token = await this.getAccessToken();

        const response = await fetch(
            `${this.baseUrl}/collection/v1_0/account/balance`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.config.environment,
                    'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get balance: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Validate account holder (check if phone number is registered)
     */
    async validateAccountHolder(phoneNumber: string): Promise<boolean> {
        const token = await this.getAccessToken();

        const response = await fetch(
            `${this.baseUrl}/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.config.environment,
                    'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
                },
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.result === true;
    }

    /**
     * Generate UUID v4
     */
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

// Singleton instance
let momoClient: MTNMoMoClient | null = null;

export function getMoMoClient(): MTNMoMoClient {
    if (!momoClient) {
        momoClient = new MTNMoMoClient({
            apiKey: process.env.MTN_MOMO_API_KEY!,
            apiUser: process.env.MTN_MOMO_API_USER!,
            subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
            environment: (process.env.MTN_MOMO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
            callbackUrl: process.env.MTN_MOMO_CALLBACK_URL || 'http://localhost:3000/api/payments/momo/callback',
        });
    }
    return momoClient;
}
