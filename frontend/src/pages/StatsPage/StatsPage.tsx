import React from 'react';
import { IconChartBar } from '../../components/ui/Icons';

export const StatsPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
            <IconChartBar className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">Insights & Stats</h2>
        <p className="text-[var(--color-brand-secondary)] max-w-xs">Track your spending habits and financial growth. Coming soon.</p>
    </div>
);
