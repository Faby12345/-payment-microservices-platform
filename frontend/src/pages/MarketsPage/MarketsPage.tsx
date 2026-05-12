import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketService, type ExchangeRateResponse, type ExchangeRateHistoryResponse } from '../../services/marketService';
import { 
    IconChartBar, 
    IconExchange, 
    IconArrowUp, 
    IconArrowDown,
    IconGrid
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis } from 'recharts';

const CurrencyChart: React.FC<{ base: string, target: string }> = ({ base, target }) => {
    const [history, setHistory] = useState<ExchangeRateHistoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await marketService.getHistoryForPair(base, target);
                // Data comes desc (newest first), reverse it for chart
                setHistory([...data].reverse());
            } catch (err) {
                console.error(`Failed to fetch history for ${base}/${target}:`, err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [base, target]);

    if (isLoading || history.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-px bg-white/5 animate-pulse" />
            </div>
        );
    }

    // If we only have one point, duplicate it to show a flat line
    const chartData = history.length === 1 
        ? [{ ...history[0], rateDate: 'prev' }, history[0]] 
        : history;

    const first = chartData[0].rate;
    const last = chartData[chartData.length - 1].rate;
    const isUp = last >= first;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id={`grad-${target}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="rateDate" hide />
                <YAxis hide domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke={isUp ? "#10b981" : "#ef4444"} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#grad-${target})`}
                    isAnimationActive={false}
                    connectNulls
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export const MarketsPage: React.FC = () => {
    const navigate = useNavigate();
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
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 md:h-48 rounded-[1.5rem] md:rounded-[2.5rem] glass-card animate-pulse" />)
                ) : (
                    featuredRates.map((rate) => (
                        <div key={rate.targetCurrency} 
                             onClick={() => navigate(`./${rate.targetCurrency}`)}
                             className="relative group p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] glass-card border border-white/10 hover:border-[var(--color-brand-accent)]/40 transition-all duration-500 overflow-hidden shadow-2xl cursor-pointer">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 md:w-40 md:h-40 bg-[var(--color-brand-accent)]/10 blur-[40px] md:blur-[60px] rounded-full group-hover:bg-[var(--color-brand-accent)]/20 transition-colors" />
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-xl md:text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {getFlag(rate.targetCurrency)}
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg md:text-2xl font-black tracking-tight">{rate.targetCurrency}</span>
                                    <span className="text-[8px] md:text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest">Target</span>
                                </div>
                            </div>

                            {/* Chart Integration for Featured Cards */}
                            <div className="mt-3 md:mt-4 h-10 md:h-16 w-full relative z-10">
                                <CurrencyChart base={rate.baseCurrency} target={rate.targetCurrency} />
                            </div>

                            <div className="mt-3 md:mt-6 relative z-10">
                                <div className="flex items-baseline gap-1 md:gap-2">
                                    <span className="text-2xl md:text-4xl font-black tracking-tighter tabular-nums">
                                        {rate.rate.toFixed(4)}
                                    </span>
                                    <span className="text-[10px] md:text-xs font-bold text-[var(--color-brand-secondary)]">RON</span>
                                </div>
                                <div className="mt-2 md:mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-green-400 text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
                                        <IconArrowUp className="w-2.5 h-2.5" />
                                        <span>Market Open</span>
                                    </div>
                                    <span className="text-[8px] md:text-[10px] font-black text-[var(--color-brand-accent)] opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        Details 
                                        <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
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
                                     onClick={() => navigate(`./${rate.targetCurrency}`)}
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

                                    <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">
                                        {/* Chart Integration for List Items */}
                                        <div className="w-16 sm:w-24 md:w-40 h-8 md:h-12">
                                            <CurrencyChart base={rate.baseCurrency} target={rate.targetCurrency} />
                                        </div>

                                        <div className="text-right min-w-[100px]">
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

                                        {/* CTA Chevron */}
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-brand-secondary)] 
                                                      group-hover:bg-[var(--color-brand-accent)]/20 group-hover:text-[var(--color-brand-accent)] 
                                                      transition-all duration-300 transform group-hover:translate-x-1 shadow-inner">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
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
