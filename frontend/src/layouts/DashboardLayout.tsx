import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
    IconPlus, 
    IconSend, 
    IconHome, 
    IconCreditCard, 
    IconChartBar, 
    IconGrid,
    IconUser
} from '../components/ui/Icons';
import { cn } from '../utils/cn';
import { type WalletResponse } from '../types/wallet.types';

interface DashboardLayoutProps {
    wallet: WalletResponse | null;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ wallet }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const navigate = useNavigate();

    const navItems = [
        { id: 'home', path: '/dashboard', label: 'Home', icon: <IconHome /> },
        { id: 'cards', path: '/cards', label: 'Cards', icon: <IconCreditCard /> },
        { id: 'payments', path: '/payments', label: 'Payments', icon: <IconSend /> },
        { id: 'stats', path: '/stats', label: 'Stats', icon: <IconChartBar /> },
        { id: 'hub', path: '/hub', label: 'Hub', icon: <IconGrid /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)] text-white flex overflow-hidden relative">
            
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
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-brand-accent)] to-[var(--color-brand-accent-light)] flex items-center justify-center shadow-glow">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter gradient-text uppercase">SecurePay</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[var(--color-brand-secondary)] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => {
                                if(window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={({ isActive }) => cn(
                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive 
                                    ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10" 
                                    : "text-[var(--color-brand-secondary)] hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-[var(--color-brand-accent)] rounded-r-full" />
                                    )}
                                    <span className={cn("transition-transform duration-300", isActive ? "scale-110 text-[var(--color-brand-accent)]" : "group-hover:scale-110")}>
                                        {item.icon}
                                    </span>
                                    <span className="font-bold tracking-tight">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 mt-auto border-t border-white/5">
                    <button 
                        onClick={handleLogout}
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
                <header className="p-4 flex items-center justify-between sticky top-0 z-30 bg-[var(--color-brand-bg)]/80 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center gap-4">
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
                        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/5 transition-colors text-[var(--color-brand-secondary)] sm:hidden">
                            <IconUser />
                        </button>
                    </div>
                </header>

                <section className="bg-[var(--color-brand-bg)] border-b border-white/5 py-3">
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

                <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
