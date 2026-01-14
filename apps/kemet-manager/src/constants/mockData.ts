/**
 * Mock data for dashboard analytics
 */

export interface DashboardData {
    revenue: {
        cars: string;
        features: string;
        total: string;
    };
    counts: {
        cars: number;
        features: number;
    };
    trends: {
        cars: string;
        features: string;
    };
    history: Array<{
        name: string;
        cars: number;
        features: number;
    }>;
    topFeatures: Array<{
        name: string;
        value: number;
    }>;
}

export interface MockDataCollection {
    day: DashboardData;
    week: DashboardData;
    month: DashboardData;
    year: DashboardData;
}

export const MOCK_DATA: MockDataCollection = {
    day: {
        revenue: { cars: "4.2M", features: "120K", total: "4.32M" },
        counts: { cars: 2, features: 14 },
        trends: { cars: "+1", features: "+5" },
        history: [
            { name: '00h', cars: 0, features: 1 },
            { name: '04h', cars: 0, features: 0 },
            { name: '08h', cars: 1, features: 3 },
            { name: '12h', cars: 0, features: 6 },
            { name: '16h', cars: 1, features: 4 },
            { name: '20h', cars: 0, features: 0 },
        ],
        topFeatures: [
            { name: 'Boost Accel.', value: 45 },
            { name: 'Sentinelle', value: 25 },
            { name: 'Connectivité', value: 20 },
            { name: 'Pack Hiver', value: 10 },
        ]
    },
    week: {
        revenue: { cars: "28.5M", features: "850K", total: "29.35M" },
        counts: { cars: 14, features: 98 },
        trends: { cars: "+3", features: "+12" },
        history: [
            { name: 'Lun', cars: 2, features: 15 },
            { name: 'Mar', cars: 3, features: 12 },
            { name: 'Mer', cars: 1, features: 20 },
            { name: 'Jeu', cars: 4, features: 18 },
            { name: 'Ven', cars: 2, features: 14 },
            { name: 'Sam', cars: 1, features: 10 },
            { name: 'Dim', cars: 1, features: 9 },
        ],
        topFeatures: [
            { name: 'Boost Accel.', value: 40 },
            { name: 'Sentinelle', value: 30 },
            { name: 'Connectivité', value: 20 },
            { name: 'Pack Hiver', value: 10 },
        ]
    },
    month: {
        revenue: { cars: "124M", features: "4.2M", total: "128.2M" },
        counts: { cars: 58, features: 412 },
        trends: { cars: "+12.5%", features: "+24.3%" },
        history: [
            { name: 'Sem 1', cars: 12, features: 85 },
            { name: 'Sem 2', cars: 15, features: 110 },
            { name: 'Sem 3', cars: 18, features: 95 },
            { name: 'Sem 4', cars: 13, features: 122 },
        ],
        topFeatures: [
            { name: 'Boost Accel.', value: 38 },
            { name: 'Sentinelle', value: 32 },
            { name: 'Connectivité', value: 22 },
            { name: 'Pack Hiver', value: 8 },
        ]
    },
    year: {
        revenue: { cars: "1.4B", features: "48M", total: "1.448B" },
        counts: { cars: 642, features: 4850 },
        trends: { cars: "+45%", features: "+62%" },
        history: [
            { name: 'Jan', cars: 45, features: 320 },
            { name: 'Fév', cars: 52, features: 410 },
            { name: 'Mar', cars: 48, features: 380 },
            { name: 'Avr', cars: 60, features: 450 },
            { name: 'Mai', cars: 55, features: 420 },
            { name: 'Juin', cars: 65, features: 500 },
        ],
        topFeatures: [
            { name: 'Boost Accel.', value: 35 },
            { name: 'Sentinelle', value: 35 },
            { name: 'Connectivité', value: 25 },
            { name: 'Pack Hiver', value: 5 },
        ]
    }
};
