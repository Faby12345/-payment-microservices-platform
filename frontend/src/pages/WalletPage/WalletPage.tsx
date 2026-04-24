// ============================================================
// 📁 src/pages/WalletPage/WalletPage.tsx
// ROLE: Main dashboard showing accounts, balance, and transactions
// ============================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
    getWalletData, 
    getTransactionHistory 
} from '../../services/walletService';
import { 
    type WalletResponse, 
    type TransactionResponse 
} from '../../types/wallet.types';
import { 
    IconPlus, 
    IconExchange, 
    IconSend, 
    IconHome, 
    IconCreditCard, 
    IconChartBar, 
    IconGrid,
    IconUser
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';

// ── Sub-components ───────────────────────────────────────────

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

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex flex-col items-center gap-1 flex-1 py-2 transition-colors",
            active ? "text-[var(--color-brand-accent)]" : "text-[var(--color-brand-secondary)] hover:text-white"
        )}
    >
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
);

// ── Main component ────────────────────────────────────────────

export const WalletPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Data State
    const [wallet, setWallet] = useState<WalletResponse | null>(null);
    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;
            
            try {
                setIsLoading(true);
                const [walletData, txData] = await Promise.all([
                    getWalletData(user.id),
                    getTransactionHistory(user.id)
                ]);
                setWallet(walletData);
                setTransactions(txData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    const totalBalance = wallet?.accounts.reduce((acc, curr) => acc + curr.balance, 0) || 0;

    const navItems = [
        { id: 'home', label: 'Home', icon: <IconHome /> },
        { id: 'cards', label: 'Cards', icon: <IconCreditCard /> },
        { id: 'payments', label: 'Payments', icon: <IconSend /> },
        { id: 'stats', label: 'Stats', icon: <IconChartBar /> },
        { id: 'hub', label: 'Hub', icon: <IconGrid /> },
    ];

    if (isLoading && !wallet) {
        return (
            <div className="min-h-screen bg-[var(--color-brand-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)] text-white flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside 
                className={cn(
                    "hidden md:flex flex-col w-64 glass-card border-r border-white/5 z-30 transition-all duration-300 ease-in-out h-screen sticky top-0",
                    !isSidebarOpen && "-ml-64"
                )}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-accent)] flex items-center justify-center shadow-glow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold gradient-text">SecurePay</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                                activeTab === item.id 
                                    ? "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/20" 
                                    : "text-[var(--color-brand-secondary)] hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <span className={cn("transition-transform duration-200", activeTab === item.id ? "scale-110" : "group-hover:scale-110")}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--color-brand-error)] hover:bg-[var(--color-brand-error)]/10 transition-colors group"
                    >
                        <IconUser />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-20 md:pb-0">
                {/* Header */}
                <header className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[var(--color-brand-bg)]/80 backdrop-blur-md border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle (Desktop) */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:flex p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--color-brand-secondary)] hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-accent)]/20 flex items-center justify-center border border-[var(--color-brand-accent)]/30">
                                <span className="text-sm font-bold text-[var(--color-brand-accent)]">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-[var(--color-brand-secondary)] font-medium">Good morning,</span>
                                <span className="text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-white/5 transition-colors text-[var(--color-brand-secondary)] md:hidden"
                        >
                            <IconUser />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
                    {/* Balance Section */}
                    <section className="text-center py-6 space-y-2">
                        <h2 className="text-[var(--color-brand-secondary)] text-sm font-medium uppercase tracking-widest">Total Balance</h2>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl md:text-6xl font-bold tracking-tight">
                                €{totalBalance.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="flex justify-center gap-6 md:gap-12">
                        <QuickAction icon={<IconPlus />} label="Add money" />
                        <QuickAction icon={<IconExchange />} label="Exchange" />
                        <QuickAction icon={<IconSend />} label="Send" />
                    </section>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Accounts */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Accounts</h3>
                                <button className="text-[var(--color-brand-accent)] text-sm font-medium">See all</button>
                            </div>
                            <div className="space-y-3">
                                {wallet?.accounts.map(account => (
                                    <div key={account.id} className="glass-card p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                                                {account.currency === 'EUR' ? '🇪🇺' : account.currency === 'USD' ? '🇺🇸' : '🇬🇧'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{account.currency === 'EUR' ? 'Euro' : account.currency === 'USD' ? 'US Dollar' : 'British Pound'}</span>
                                                <span className="text-xs text-[var(--color-brand-secondary)] uppercase">{account.currency}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">
                                                {account.currency === 'EUR' ? '€' : account.currency === 'USD' ? '$' : '£'}
                                                {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {wallet?.accounts.length === 0 && (
                                    <p className="text-[var(--color-brand-secondary)] text-sm italic py-4 text-center">No accounts found.</p>
                                )}
                            </div>
                        </section>

                        {/* Recent Transactions */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Transactions</h3>
                                <button className="text-[var(--color-brand-accent)] text-sm font-medium">View all</button>
                            </div>
                            <div className="space-y-1">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform border border-white/5">
                                                {tx.type === 'DEPOSIT' ? '💰' : tx.type === 'WITHDRAWAL' ? '☕' : tx.type === 'EXCHANGE' ? '💱' : '💸'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{tx.description || tx.type}</span>
                                                <span className="text-xs text-[var(--color-brand-secondary)]">
                                                    {tx.type} • {new Date(tx.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "font-bold text-sm",
                                            tx.type === 'DEPOSIT' ? "text-[var(--color-brand-success)]" : "text-white"
                                        )}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.destinationAmount.toFixed(2)} {tx.destinationCurrency}
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <p className="text-[var(--color-brand-secondary)] text-sm italic py-4 text-center">No transactions yet.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Bottom Navigation (Mobile/Tablet only) */}
            <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/5 flex items-center justify-around py-2 px-6 backdrop-blur-xl z-20 md:hidden">
                {navItems.map((item) => (
                    <NavItem 
                        key={item.id}
                        icon={item.icon} 
                        label={item.label} 
                        active={activeTab === item.id} 
                        onClick={() => setActiveTab(item.id)} 
                    />
                ))}
            </nav>
        </div>
    );
};
