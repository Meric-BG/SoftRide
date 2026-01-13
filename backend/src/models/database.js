const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

class Database {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const raw = fs.readFileSync(DB_PATH, 'utf8');
            return JSON.parse(raw);
        } catch (error) {
            console.error('Error loading database:', error);
            return {
                users: [],
                vehicles: [],
                features: [],
                purchases: [],
                updates: [],
                analytics: {}
            };
        }
    }

    save() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    // Users
    getUsers() {
        return this.data.users;
    }

    getUserById(id) {
        return this.data.users.find(u => u.id === id);
    }

    getUserByEmail(email) {
        return this.data.users.find(u => u.email === email);
    }

    createUser(user) {
        this.data.users.push(user);
        this.save();
        return user;
    }

    // Vehicles
    getVehicles() {
        return this.data.vehicles;
    }

    getVehicleById(id) {
        return this.data.vehicles.find(v => v.id === id);
    }

    updateVehicle(id, updates) {
        const index = this.data.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            this.data.vehicles[index] = { ...this.data.vehicles[index], ...updates };
            this.save();
            return this.data.vehicles[index];
        }
        return null;
    }

    // Features
    getFeatures() {
        return this.data.features.filter(f => f.active);
    }

    getFeatureById(id) {
        return this.data.features.find(f => f.id === id);
    }

    // Purchases
    getPurchases() {
        return this.data.purchases;
    }

    getPurchasesByUserId(userId) {
        return this.data.purchases.filter(p => p.userId === userId);
    }

    getPurchasesByVehicleId(vehicleId) {
        return this.data.purchases.filter(p => p.vehicleId === vehicleId);
    }

    createPurchase(purchase) {
        this.data.purchases.push(purchase);
        this.save();
        return purchase;
    }

    // Updates
    getUpdates() {
        return this.data.updates;
    }

    getUpdateById(id) {
        return this.data.updates.find(u => u.id === id);
    }

    createUpdate(update) {
        this.data.updates.unshift(update);
        this.save();
        return update;
    }

    // Analytics
    getAnalytics() {
        return this.data.analytics;
    }

    updateAnalytics(analytics) {
        this.data.analytics = { ...this.data.analytics, ...analytics };
        this.save();
    }
}

module.exports = new Database();
