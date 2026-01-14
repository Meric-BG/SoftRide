// API Client for My Kemet
// Connects to the backend API at http://localhost:5001

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class APIClient {
    token: string | null;

    constructor() {
        this.token = null;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }


    async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async register(email: string, password: string, name: string, brand: string, model: string, phone?: string) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, brand, model, phone }),
        });
        this.setToken(data.token);
        return data;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    async updatePhone(phone: string) {
        return this.request('/auth/phone', {
            method: 'PUT',
            body: JSON.stringify({ phone }),
        });
    }

    async updateEmail(email: string) {
        return this.request('/auth/email', {
            method: 'PUT',
            body: JSON.stringify({ email }),
        });
    }

    logout() {
        this.clearToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }
    }

    // Vehicles
    async getVehicle(vehicleId: string) {
        return this.request(`/vehicles/${vehicleId}`);
    }

    async toggleLock(vehicleId: string, locked: boolean) {
        return this.request(`/vehicles/${vehicleId}/lock`, {
            method: 'POST',
            body: JSON.stringify({ locked }),
        });
    }

    async toggleClimate(vehicleId: string, climate: boolean) {
        return this.request(`/vehicles/${vehicleId}/climate`, {
            method: 'POST',
            body: JSON.stringify({ climate }),
        });
    }

    async toggleCharge(vehicleId: string, charging: boolean) {
        return this.request(`/vehicles/${vehicleId}/charge`, {
            method: 'POST',
            body: JSON.stringify({ charging }),
        });
    }

    async getVehicleFeatures(vehicleId: string) {
        return this.request(`/vehicles/${vehicleId}/features`);
    }

    // Store
    async getFeatures() {
        return this.request('/store/features');
    }

    async purchaseFeature(featureId: string, vehicleId: string) {
        return this.request('/store/purchase', {
            method: 'POST',
            body: JSON.stringify({ featureId, vehicleId }),
        });
    }

    async getPurchases() {
        return this.request('/store/purchases');
    }

    // Updates
    async getAvailableUpdates(vehicleId: string) {
        return this.request(`/updates/available/${vehicleId}`);
    }

    async installUpdate(vehicleId: string, campaignId: string) {
        return this.request(`/updates/install/${vehicleId}/${campaignId}`, {
            method: 'POST',
        });
    }
}

export const api = new APIClient();
