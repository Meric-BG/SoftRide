// API Client for Kemet Manager (Admin)
// Connects to the backend API at http://localhost:5000

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class AdminAPIClient {
    constructor() {
        this.token = null;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('admin_token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
        }
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
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

    // Analytics
    async getOverview() {
        return this.request('/analytics/overview');
    }

    async getRevenue() {
        return this.request('/analytics/revenue');
    }

    async getFleet() {
        return this.request('/analytics/fleet');
    }

    async getTopSales() {
        return this.request('/analytics/top-sales');
    }

    // Updates/FOTA
    async getAllUpdates() {
        return this.request('/updates');
    }

    async deployUpdate(version: string, notes: string, targetVehicles?: number) {
        return this.request('/updates/deploy', {
            method: 'POST',
            body: JSON.stringify({ version, notes, targetVehicles }),
        });
    }

    async getUpdateStats() {
        return this.request('/updates/stats');
    }

    // Store
    async getFeatures() {
        return this.request('/store/features');
    }

    async getPurchases() {
        return this.request('/store/purchases');
    }
}

export const adminApi = new AdminAPIClient();
