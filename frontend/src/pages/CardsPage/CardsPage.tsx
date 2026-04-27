import React from 'react';
import { IconCreditCard } from '../../components/ui/Icons';

export const CardsPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
            <IconCreditCard className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">Cards</h2>
        <p className="text-[var(--color-brand-secondary)] max-w-xs">Manage your physical and virtual cards. This feature is coming soon.</p>
    </div>
);
