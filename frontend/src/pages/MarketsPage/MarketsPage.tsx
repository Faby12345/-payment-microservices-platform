import React, { useEffect, useState } from 'react';
import { marketService, type ExchangeRateResponse } from '../../services/marketService';
import { 
    IconChartBar, 
    IconExchange, 
    IconArrowUp, 
    IconArrowDown,
    IconGrid
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';

export const MarketsPage: React.FC = () => {
    const [rates, setRates] = useState<ExchangeRateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setIsLoading(true);
                const data = await marketService.getCurrentRates();
                const ronBaseRates = data.filter(r => r.baseCurrency === 'RON');
                setRates(ronBaseRates);
            } catch (err) {
                console.error("Failed to fetch market rates:", err);
                setError("Could not load market data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, []);

    const getFlag = (currency: string) => {
        switch (currency) {
            case 'EUR': return '🇪🇺';
            case 'USD': return '🇺🇸';
            case 'GBP': return '🇬🇧';
            case 'CHF': return '🇨🇭';
            case 'CAD': return '🇨🇦';
            case 'AUD': return '🇦🇺';
            case 'JPY': return '🇯🇵';
            case 'CZK': return '🇨🇿';
            case 'PLN': return '🇵🇱';
            case 'HUF': return '🇭🇺';
            default: return '🏳️';
        }
    };

    const featuredCurrencies = ['EUR', 'USD', 'GBP'];
    const featuredRates = rates.filter(r => featuredCurrencies.includes(r.targetCurrency));
    const otherRates = rates.filter(r => !featuredCurrencies.includes(r.targetCurrency));

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-fade-in pb-10 px-4">
            {/* --- Hero Header --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[var(--color-brand-accent)] mb-1">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Markets</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                        Global <span className="gradient-text">Exchange</span>
                    </h1>
                    <p className="text-[var(--color-brand-secondary)] font-medium text-xs md:text-sm">
                        Official BNR reference rates.
                    </p>
                </div>
                
                <button 
                    onClick={() => window.location.reload()}
                    className="h-10 md:h-12 px-5 md:px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 
                             transition-all flex items-center justify-center gap-2 font-bold text-xs md:text-sm group active:scale-95"
                >
                    <IconExchange className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    Sync Data
                </button>
            </header>

            {/* --- Featured Rates Grid --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-40 md:h-48 rounded-[2rem] md:rounded-[2.5rem] glass-card animate-pulse" />)
                ) : (
                    featuredRates.map((rate) => (
                        <div key={rate.targetCurrency} 
                             className="relative group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] glass-card border border-white/10 hover:border-[var(--color-brand-accent)]/40 transition-all duration-500 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 md:w-40 md:h-40 bg-[var(--color-brand-accent)]/10 blur-[50px] md:blur-[60px] rounded-full group-hover:bg-[var(--color-brand-accent)]/20 transition-colors" />
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {getFlag(rate.targetCurrency)}
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl md:text-2xl font-black tracking-tight">{rate.targetCurrency}</span>
                                    <span className="text-[9px] md:text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest">Target</span>
                                </div>
                            </div>

                            <div className="mt-6 md:mt-8 relative z-10">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums">
                                        {rate.rate.toFixed(4)}
                                    </span>
                                    <span className="text-xs font-bold text-[var(--color-brand-secondary)]">RON</span>
                                </div>
                                <div className="mt-3 md:mt-4 flex items-center gap-2 text-green-400 text-[9px] md:text-[10px] font-black uppercase tracking-tighter">
                                    <IconArrowUp className="w-3 h-3" />
                                    <span>Market Open</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* --- Other Markets List --- */}
            <section className="">
                <div className="glass-card rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="px-6 md:px-8 py-4 md:py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h3 className="text-base md:text-lg font-black tracking-tight flex items-center gap-3">
                            <IconGrid className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-brand-secondary)]" />
                            All Markets
                        </h3>
                        <span className="text-[9px] md:text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.2em]">
                            {otherRates.length} Pairs
                        </span>
                    </div>

                    <div className="divide-y divide-white/5">
                        {isLoading ? (
                            [1,2,3,4].map(i => <div key={i} className="h-16 md:h-20 animate-pulse bg-white/5" />)
                        ) : (
                            otherRates.map((rate) => (
                                <div key={rate.targetCurrency} 
                                     className="group flex items-center justify-between p-4 md:p-6 md:px-8 hover:bg-white/[0.03] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 md:gap-5">
                                        <span className="text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">
                                            {getFlag(rate.targetCurrency)}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm md:text-base tracking-tight">{rate.targetCurrency}</span>
                                            <span className="hidden sm:block text-[8px] md:text-[10px] text-[var(--color-brand-secondary)] font-black uppercase tracking-widest">
                                                Romanian Leu
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:gap-16">
                                        <div className="hidden lg:block w-32 h-8">
                                            <svg viewBox="0 0 100 30" className="w-full h-full text-green-500/30">
                                                <path d="M0 20 Q 25 5, 50 15 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1 md:gap-2">
                                                <span className="text-lg md:text-xl font-black tracking-tighter tabular-nums">
                                                    {rate.rate.toFixed(4)}
                                                </span>
                                                <span className="text-[9px] md:text-[10px] font-bold text-[var(--color-brand-secondary)]">RON</span>
                                            </div>
                                            <span className="text-[8px] md:text-[9px] text-[var(--color-brand-secondary)] font-medium">
                                                {new Date(rate.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};
