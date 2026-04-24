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

// ── Main component ────────────────────────────────────────────

export const WalletPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    
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
        <div className="min-h-screen bg-[var(--color-brand-bg)] text-white flex overflow-hidden relative">
            
            {/* --- Liquid Glass Sidebar --- */}
            
            {/* Backdrop Overlay (Mobile only) */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 lg:hidden",
                    isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside 
                className={cn(
                    "fixed lg:relative inset-y-0 left-0 w-72 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "bg-white/[0.03] backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.3)] flex flex-col",
                    !isSidebarOpen ? "-translate-x-full lg:-ml-72" : "translate-x-0"
                )}
            >
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-brand-accent)] to-[var(--color-brand-accent-light)] flex items-center justify-center shadow-glow">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter gradient-text uppercase">SecurePay</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[var(--color-brand-secondary)] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if(window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                activeTab === item.id 
                                    ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10" 
                                    : "text-[var(--color-brand-secondary)] hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {activeTab === item.id && (
                                <div className="absolute left-0 w-1 h-6 bg-[var(--color-brand-accent)] rounded-r-full" />
                            )}
                            <span className={cn("transition-transform duration-300", activeTab === item.id ? "scale-110 text-[var(--color-brand-accent)]" : "group-hover:scale-110")}>
                                {item.icon}
                            </span>
                            <span className="font-bold tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto border-t border-white/5">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--color-brand-secondary)] hover:text-white transition-all duration-300 group"
                    >
                        <div className="p-2 rounded-lg bg-red-500/5 text-red-500/40 group-hover:bg-red-500/10 group-hover:text-red-400 transition-colors border border-red-500/5">
                            <IconUser />
                        </div>
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Header */}
                <header className="p-4 flex items-center justify-between sticky top-0 z-30 bg-[var(--color-brand-bg)]/80 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Toggle (Visible on all sizes now) */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 rounded-xl hover:bg-white/5 transition-all text-[var(--color-brand-secondary)] hover:text-white border border-white/5 active:scale-90"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-accent)]/20 flex items-center justify-center border border-white/10">
                                <span className="text-sm font-black text-[var(--color-brand-accent)]">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </span>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-[var(--color-brand-secondary)] font-black uppercase tracking-widest">Dashboard</span>
                                <span className="text-sm font-bold">{user?.firstName} {user?.lastName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[var(--color-brand-secondary)] text-xs font-bold">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live System
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-white/5 transition-colors text-[var(--color-brand-secondary)] sm:hidden">
                            <IconUser />
                        </button>
                    </div>
                </header>

                {/* --- Account Navigation (Below Header) --- */}
                <section className="sticky top-[73px] z-20 bg-[var(--color-brand-bg)]/90 backdrop-blur-md border-b border-white/5 py-3">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 max-w-5xl mx-auto">
                        {wallet?.accounts.map(account => (
                            <button key={account.id} 
                                 className={cn(
                                     "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 border border-white/5 whitespace-nowrap",
                                     "hover:bg-white/10 active:scale-95 group bg-white/5"
                                 )}>
                                <span className="text-xl">{account.currency === 'EUR' ? '🇪🇺' : account.currency === 'USD' ? '🇺🇸' : '🇬🇧'}</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] text-[var(--color-brand-secondary)] font-black uppercase tracking-tighter mb-1">
                                        {account.currency}
                                    </span>
                                    <span className="font-black text-sm">
                                        {account.currency === 'EUR' ? '€' : account.currency === 'USD' ? '$' : '£'}
                                        {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </button>
                        ))}
                        <button className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-dashed border-white/20 text-[var(--color-brand-secondary)] hover:text-white transition-all bg-transparent">
                            <IconPlus className="w-4 h-4" />
                            <span className="text-xs font-black uppercase">Add Account</span>
                        </button>
                    </div>
                </section>

                <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full space-y-6 animate-fade-in relative">
                    
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
                            <QuickAction icon={<IconSend className="w-5 h-5" />} label="Send" />
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
                </main>
            </div>
        </div>
    );
};
