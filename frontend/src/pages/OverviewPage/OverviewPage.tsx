import React from 'react';
import { 
    IconPlus, 
    IconExchange, 
    IconSend,
    IconChartBar
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { type TransactionResponse } from '../../types/wallet.types';

interface OverviewPageProps {
    totalBalance: number;
    transactions: TransactionResponse[];
}

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-2 group transition-all"
    >
        <div className="w-12 h-12 rounded-full bg-[var(--color-brand-accent)]/10 flex items-center justify-center 
                      text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/20 
                      group-hover:bg-[var(--color-brand-accent)] group-hover:text-white transition-all duration-300">
            {icon}
        </div>
        <span className="text-xs font-medium text-[var(--color-brand-secondary)] group-hover:text-white transition-colors">
            {label}
        </span>
    </button>
);

export const OverviewPage: React.FC<OverviewPageProps> = ({ totalBalance, transactions }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* --- Balance Hero Section --- */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[var(--color-brand-accent)]/20 to-transparent p-8 md:p-10 text-center border border-white/5 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-brand-accent)]/30 blur-[80px] rounded-full -z-10 animate-pulse" />
                
                <div className="space-y-2">
                    <h2 className="text-[var(--color-brand-secondary)] text-xs font-bold uppercase tracking-[0.2em]">
                        Combined Capital
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            €{totalBalance.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 flex justify-center gap-6 md:gap-10">
                    <QuickAction icon={<IconPlus className="w-5 h-5" />} label="Add" />
                    <QuickAction 
                        icon={<IconSend className="w-5 h-5" />} 
                        label="Send" 
                        onClick={() => navigate('/payments')}
                    />
                    <QuickAction icon={<IconExchange className="w-5 h-5" />} label="Exchange" />
                </div>
            </section>

            {/* --- Recent Activity --- */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                    <button className="text-[var(--color-brand-accent)] text-sm font-semibold hover:underline">View All</button>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-xl">
                    <div className="divide-y divide-white/5">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <div key={tx.id} 
                                     className="flex items-center justify-between p-5 md:p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-300">
                                            {tx.type === 'DEPOSIT' ? '💰' : tx.type === 'WITHDRAWAL' ? '☕' : tx.type === 'EXCHANGE' ? '💱' : '💸'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-white group-hover:text-[var(--color-brand-accent-light)] transition-colors">
                                                {tx.description || tx.type}
                                            </span>
                                            <span className="text-xs text-[var(--color-brand-secondary)] font-medium">
                                                {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "font-black text-sm md:text-base tracking-tight",
                                            tx.type === 'DEPOSIT' ? "text-[var(--color-brand-success)]" : "text-white"
                                        )}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.destinationAmount.toFixed(2)} {tx.destinationCurrency}
                                        </div>
                                        <div className="text-[10px] text-[var(--color-brand-secondary)] font-bold uppercase tracking-tighter">
                                            {tx.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                    <IconChartBar />
                                </div>
                                <p className="text-[var(--color-brand-secondary)] text-sm font-medium">No activity to show yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};
