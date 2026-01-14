import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    subValue: string;
    icon: React.ReactNode;
    color: 'green' | 'amber' | 'blue' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, color }) => (
    <div className="stat-card">
        <div className="sc-top">
            <span className="sc-title">{title}</span>
            <div className={`sc-icon-box ${color}`}>{icon}</div>
        </div>
        <div className="sc-body">
            <div className="sc-value">{value}</div>
            <div className="sc-sub">
                <ArrowUpRight size={12} color="#10B981" />
                {subValue}
            </div>
        </div>
    </div>
);

export default StatCard;
