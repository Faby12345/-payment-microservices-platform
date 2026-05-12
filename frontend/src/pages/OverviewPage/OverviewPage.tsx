import React, { useState } from 'react';
import { 
    IconPlus,
    IconExchange, 
    IconSend,
    IconChartBar,
    IconCopy,
    IconCheck
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { type TransactionResponse, type WalletResponse, type PaginatedResponse } from '../../types/wallet.types';

interface OverviewPageProps {
    totalBalance: number;
    transactionsPage: PaginatedResponse<TransactionResponse> | null;
    wallet: WalletResponse | null;
    selectedAccountId: string | null;
    onRefresh: (page?: number, type?: string, status?: string) => void;
    onAddAccount: () => void;
    filterType: string;
    filterStatus: string;
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

export const OverviewPage: React.FC<OverviewPageProps> = ({ 
    totalBalance, 
    transactionsPage, 
    wallet, 
    selectedAccountId, 
    onRefresh, 
    onAddAccount,
    filterType,
    filterStatus
}) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    // Filter data based on selected account
    const selectedAccount = wallet?.accounts.find(a => a.id === selectedAccountId);

    const handleCopyIban = () => {
        if (selectedAccount?.iban) {
            navigator.clipboard.writeText(selectedAccount.iban);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const displayBalance = selectedAccount ? selectedAccount.balance : totalBalance;
    const displayCurrency = selectedAccount ? selectedAccount.currency : 'EUR';
    const displayTitle = selectedAccount ? `${selectedAccount.currency} Account` : 'Combined Capital';

    const transactions = transactionsPage?.content || [];

    const filteredTransactions = selectedAccountId 
        ? transactions.filter(tx => 
            tx.fromAccountId === selectedAccountId || tx.toAccountId === selectedAccountId
          )
        : transactions;

    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* --- Balance Hero Section --- */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[var(--color-brand-accent)]/20 to-transparent p-8 md:p-10 text-center border border-white/5 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-brand-accent)]/30 blur-[80px] rounded-full -z-10 animate-pulse" />
                
                <div className="space-y-2">
                    <h2 className="text-[var(--color-brand-secondary)] text-xs font-bold uppercase tracking-[0.2em]">
                        {displayTitle}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            {displayCurrency === 'EUR' ? '€' : displayCurrency === 'USD' ? '$' : displayCurrency === 'GBP' ? '£' : ''}
                            {displayBalance.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                        </span>
                        {displayCurrency === 'RON' && <span className="text-2xl font-bold opacity-60 ml-2">lei</span>}
                    </div>
                    {selectedAccount && (
                        <div className="text-[15px] font-mono text-[var(--color-brand-secondary)] tracking-widest mt-2 opacity-70">
                            {selectedAccount.iban}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 flex justify-center gap-6 md:gap-10">
                    <QuickAction 
                        icon={<IconPlus className="w-5 h-5" />} 
                        label="Add" 
                    />
                    {selectedAccount && (
                        <QuickAction 
                            icon={copied ? <IconCheck className="w-5 h-5" /> : <IconCopy className="w-5 h-5" />} 
                            label={copied ? "Copied" : "Copy"} 
                            onClick={handleCopyIban}
                        />
                    )}
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h3 className="text-xl font-bold tracking-tight">
            {selectedAccountId ? 'Account Activity' : 'Recent Activity'}
        </h3>
        
        <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <select 
                value={filterType}
                onChange={(e) => onRefresh(0, e.target.value, filterStatus)}
                className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-brand-secondary)] outline-none focus:border-[var(--color-brand-accent)]/50 transition-all cursor-pointer"
            >
                <option value="ALL">All Types</option>
                <option value="DEPOSIT" className="bg-[var(--color-brand-bg)]">Deposit</option>
                <option value="WITHDRAWAL" className="bg-[var(--color-brand-bg)]">Withdrawal</option>
                <option value="TRANSFER" className="bg-[var(--color-brand-bg)]">Transfer</option>
                <option value="EXCHANGE" className="bg-[var(--color-brand-bg)]">Exchange</option>
                <option value="FEE" className="bg-[var(--color-brand-bg)]">Fee</option>
            </select>

            {/* Status Filter */}
            <select 
                value={filterStatus}
                onChange={(e) => onRefresh(0, filterType, e.target.value)}
                className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-brand-secondary)] outline-none focus:border-[var(--color-brand-accent)]/50 transition-all cursor-pointer"
            >
                <option value="ALL">All Status</option>
                <option value="PENDING" className="bg-[var(--color-brand-bg)]">Pending</option>
                <option value="PROCESSING" className="bg-[var(--color-brand-bg)]">Processing</option>
                <option value="COMPLETED" className="bg-[var(--color-brand-bg)]">Completed</option>
                <option value="FAILED" className="bg-[var(--color-brand-bg)]">Failed</option>
                <option value="CANCELLED" className="bg-[var(--color-brand-bg)]">Cancelled</option>
            </select>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)] opacity-50">
                    Page {transactionsPage ? transactionsPage.number + 1 : 1} of {transactionsPage?.totalPages || 1}
                </span>
                <div className="flex gap-2">
                    <button 
                        disabled={transactionsPage?.first}
                        onClick={() => onRefresh((transactionsPage?.number || 0) - 1)}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-[var(--color-brand-secondary)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        disabled={transactionsPage?.last}
                        onClick={() => onRefresh((transactionsPage?.number || 0) + 1)}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-[var(--color-brand-secondary)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-xl">
        <div className="divide-y divide-white/5">
            {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (

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
