import React from 'react';
import { SendMoney } from '../../components/ui/SendMoney';
import { IconSend } from '../../components/ui/Icons';
import { useNavigate } from 'react-router-dom';
import { type WalletResponse } from '../../types/wallet.types';

interface PaymentsPageProps {
    wallet: WalletResponse | null;
    totalBalance: number;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ wallet, totalBalance }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* --- Subtle Tab Header --- */}
            <div className="flex items-center justify-between px-2 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-accent)]/10 flex items-center justify-center text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/20">
                        <IconSend />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold capitalize">Payments</h2>
                        <p className="text-xs text-[var(--color-brand-secondary)] font-medium">Manage your transfers and payments</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] text-[var(--color-brand-secondary)] font-black uppercase tracking-widest">Total Balance</span>
                    <span className="text-lg font-bold">€{totalBalance.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <SendMoney 
                onClose={() => navigate('/dashboard')} 
                accounts={wallet?.accounts.map(a => ({
                    id: a.id,
                    balance: a.balance,
                    currency: a.currency,
                    type: a.type
                })) || []} 
            />
        </div>
    );
};
