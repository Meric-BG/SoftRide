// API Client for Kemet Manager (Admin)
// Connects to the backend API

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class AdminAPIClient {
    token: string | null;

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

    getBaseUrl() {
        return API_URL;
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

    // Analytics
    async getOverview() { return this.request('/analytics/overview'); }
    async getRevenue() { return this.request('/analytics/revenue'); }
    async getFleet() { return this.request('/analytics/fleet'); }
    async getTopSales() { return this.request('/analytics/top-sales'); }
    async listVehicles() { return this.request('/vehicles'); }

    // FOTA
    async getAllUpdates() { return this.request('/updates'); }
    async deployUpdate(version: string, notes: string, targetVehicles?: number) {
        return this.request('/updates/deploy', {
            method: 'POST',
            body: JSON.stringify({ version, notes, targetVehicles }),
        });
    }

    // Requests
    async getAllRequests() { return this.request('/requests/all'); }
    async updateRequest(id: string, status: string, notes: string) {
        return this.request(`/requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, admin_notes: notes }),
        });
    }

    async transcribeVoice(audioBlob: Blob): Promise<{ text: string }> {
        const formData = new FormData();
        const extension = audioBlob.type.includes('webm') ? 'webm' :
            audioBlob.type.includes('ogg') ? 'ogg' : 'wav';
        formData.append('audio', audioBlob, `audio.${extension}`);

        const response = await fetch(`${API_URL}/requests/whisper`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}` },
            body: formData,
        });

        if (!response.ok) throw new Error('Transcription failed');
        return response.json();
    }

    async regenerateAIAnalysis(id: string) {
        return this.request(`/requests/${id}/analyze`, {
            method: 'POST',
        });
    }
}

export const adminApi = new AdminAPIClient();
