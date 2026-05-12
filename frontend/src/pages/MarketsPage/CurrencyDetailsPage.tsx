import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketService, type ExchangeRateHistoryResponse } from '../../services/marketService';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { 
    IconArrowUp, 
    IconArrowDown, 
    IconExchange,
    IconChartBar
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';

export const CurrencyDetailsPage: React.FC = () => {
    const { currency } = useParams<{ currency: string }>();
    const navigate = useNavigate();
    const [history, setHistory] = useState<ExchangeRateHistoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currency) return;
            try {
                setIsLoading(true);
                const data = await marketService.getHistoryForPair('RON', currency);
                setHistory([...data].reverse());
            } catch (err) {
                console.error("Failed to fetch currency details:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [currency]);

    const stats = useMemo(() => {
        if (history.length === 0) return null;
        
        const rates = history.map(h => h.rate);
        const max = Math.max(...rates);
        const min = Math.min(...rates);
        const current = rates[rates.length - 1];
        const start = rates[0];
        const change = current - start;
        const changePercent = (change / start) * 100;

        return {
            max,
            min,
            current,
            change,
            changePercent,
            volatility: ((max - min) / min) * 100
        };
    }, [history]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
            </div>
        );
    }

    if (!stats || !currency) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-[var(--color-brand-secondary)]">No data found for this currency.</p>
                <button onClick={() => navigate(-1)} className="text-[var(--color-brand-accent)] font-bold">Go Back</button>
            </div>
        );
    }

    const isUp = stats.change >= 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-black tracking-tighter">RON / {currency}</h2>
                            <span className={cn(
                                "text-xs font-black px-2 py-1 rounded-lg",
                                isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            )}>
                                {isUp ? '+' : ''}{stats.changePercent.toFixed(2)}%
                            </span>
                        </div>
                        <p className="text-[var(--color-brand-secondary)] text-sm font-medium">Historical Market Performance</p>
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailStatCard title="Current Rate" value={stats.current.toFixed(4)} subtitle="Latest BNR" />
                <DetailStatCard title="All-time High" value={stats.max.toFixed(4)} subtitle="Historical Peak" />
                <DetailStatCard title="All-time Low" value={stats.min.toFixed(4)} subtitle="Historical Bottom" />
                <DetailStatCard title="Volatility" value={`${stats.volatility.toFixed(2)}%`} subtitle="Range intensity" />
            </div>

            {/* Large Interactive Chart */}
            <div className="glass-card rounded-[2.5rem] p-6 md:p-8 border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <IconChartBar className="text-[var(--color-brand-accent)]" />
                        Exchange Rate Trend
                    </h3>
                    <div className="flex gap-2">
                        {['1W', '1M', '3M', '1Y', 'ALL'].map(period => (
                            <button key={period} className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-[var(--color-brand-secondary)] hover:text-white transition-colors">
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="rateDate" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--color-brand-secondary)', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--color-brand-secondary)', fontSize: 10, fontWeight: 700 }}
                                domain={['auto', 'auto']}
                                orientation="right"
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--color-brand-bg)', 
                                    borderRadius: '1.5rem', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                    padding: '1rem'
                                }}
                                itemStyle={{ color: 'white', fontWeight: 'bold' }}
                                labelStyle={{ color: 'var(--color-brand-secondary)', marginBottom: '0.5rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="rate" 
                                stroke="var(--color-brand-accent)" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorRate)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const DetailStatCard: React.FC<{ title: string, value: string, subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-1">
        <p className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black tabular-nums">{value}</p>
        <p className="text-[10px] text-[var(--color-brand-secondary)] font-medium italic opacity-50">{subtitle}</p>
    </div>
);
