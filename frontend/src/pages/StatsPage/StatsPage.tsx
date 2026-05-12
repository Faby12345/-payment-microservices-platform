import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllTransactionHistory, getWalletData } from '../../services/walletService';
import { type TransactionResponse, type WalletResponse } from '../../types/wallet.types';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart, 
    Pie, 
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { 
    IconChartBar, 
    IconArrowUp, 
    IconArrowDown, 
    IconExchange 
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';

interface StatsSummary {
    totalSpent: number;
    totalEarned: number;
    netSavings: number;
    savingsRate: number;
}

export const StatsPage: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [wallet, setWallet] = useState<WalletResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                setIsLoading(true);
                const [txs, walletData] = await Promise.all([
                    getAllTransactionHistory(user.id),
                    getWalletData(user.id)
                ]);
                setTransactions(txs);
                setWallet(walletData);
            } catch (error) {
                console.error("Failed to fetch stats data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const summary = useMemo((): StatsSummary => {
        let spent = 0;
        let earned = 0;

        transactions.forEach(tx => {
            if (tx.status !== 'COMPLETED') return;

            // Simple heuristic: if it's a deposit, it's earned. 
            // If it's a withdrawal or fee, it's spent.
            // If it's a transfer, we check if the user is sender or receiver.
            // For now, let's use the 'type'
            if (tx.type === 'DEPOSIT') {
                earned += tx.destinationAmount;
            } else if (tx.type === 'WITHDRAWAL' || tx.type === 'FEE') {
                spent += tx.destinationAmount;
            } else if (tx.type === 'TRANSFER') {
                // If user is fromAccount, they spent. If user is toAccount, they earned.
                // In this simplified view, we check if the account is one of user's accounts
                const userAccountIds = wallet?.accounts.map(a => a.id) || [];
                const isFromUser = tx.fromAccountId && userAccountIds.includes(tx.fromAccountId);
                const isToUser = tx.toAccountId && userAccountIds.includes(tx.toAccountId);

                if (isFromUser && !isToUser) spent += tx.sourceAmount;
                if (isToUser && !isFromUser) earned += tx.destinationAmount;
                // Internal transfers (between user's own accounts) are excluded from summary
            }
        });

        const net = earned - spent;
        const rate = earned > 0 ? (net / earned) * 100 : 0;

        return {
            totalSpent: spent,
            totalEarned: earned,
            netSavings: net,
            savingsRate: Math.max(0, rate)
        };
    }, [transactions, wallet]);

    const trendData = useMemo(() => {
        const groups: Record<string, { date: string, spent: number, earned: number }> = {};
        
        // Last 30 days
        const last30Days = [...Array(30)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last30Days.forEach(date => {
            groups[date] = { date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), spent: 0, earned: 0 };
        });

        transactions.forEach(tx => {
            const date = tx.createdAt.split('T')[0];
            if (groups[date]) {
                if (tx.type === 'DEPOSIT') {
                    groups[date].earned += tx.destinationAmount;
                } else if (tx.type === 'WITHDRAWAL' || tx.type === 'FEE') {
                    groups[date].spent += tx.destinationAmount;
                } else if (tx.type === 'TRANSFER') {
                    const userAccountIds = wallet?.accounts.map(a => a.id) || [];
                    const isFromUser = tx.fromAccountId && userAccountIds.includes(tx.fromAccountId);
                    const isToUser = tx.toAccountId && userAccountIds.includes(tx.toAccountId);
                    if (isFromUser && !isToUser) groups[date].spent += tx.sourceAmount;
                    if (isToUser && !isFromUser) groups[date].earned += tx.destinationAmount;
                }
            }
        });

        return Object.values(groups);
    }, [transactions, wallet]);

    const distributionData = useMemo(() => {
        const types: Record<string, number> = {};
        transactions.forEach(tx => {
            if (tx.type === 'DEPOSIT') return; // Only spending
            
            // For transfers, only count if outgoing
            if (tx.type === 'TRANSFER') {
                const userAccountIds = wallet?.accounts.map(a => a.id) || [];
                const isFromUser = tx.fromAccountId && userAccountIds.includes(tx.fromAccountId);
                const isToUser = tx.toAccountId && userAccountIds.includes(tx.toAccountId);
                if (!isFromUser || isToUser) return;
            }

            types[tx.type] = (types[tx.type] || 0) + tx.sourceAmount;
        });

        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [transactions, wallet]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <header className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Financial Insights
                </h2>
                <p className="text-[var(--color-brand-secondary)] text-sm font-medium">
                    Analysis of your spending and earning patterns.
                </p>
            </header>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard 
                    title="Total Spent" 
                    value={summary.totalSpent} 
                    icon={<IconArrowDown className="w-5 h-5 md:w-6 md:h-6 text-red-400" />}
                    trend="+12%" 
                    color="red"
                />
                <SummaryCard 
                    title="Total Earned" 
                    value={summary.totalEarned} 
                    icon={<IconArrowUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
                    trend="+5%" 
                    color="emerald"
                />
                <SummaryCard 
                    title="Net Savings" 
                    value={summary.netSavings} 
                    icon={<IconChartBar className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />}
                    trend="Stable" 
                    color="blue"
                />
                <SummaryCard 
                    title="Savings Rate" 
                    value={`${summary.savingsRate.toFixed(1)}%`} 
                    icon={<IconExchange className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />}
                    trend="Good" 
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-2 glass-card rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-white/5 space-y-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="font-bold text-lg">Spending Trend</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[var(--color-brand-accent)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-secondary)]">Spent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-secondary)]">Earned</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--color-brand-secondary)', fontSize: 9, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--color-brand-secondary)', fontSize: 9, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--color-brand-bg)', 
                                        borderRadius: '1rem', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="spent" 
                                    stroke="var(--color-brand-accent)" 
                                    strokeWidth={3} 
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="earned" 
                                    stroke="#10b981" 
                                    strokeWidth={3} 
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-white/5 space-y-6">
                    <h3 className="font-bold text-lg">Distribution</h3>
                    <div className="h-[250px] md:h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--color-brand-bg)', 
                                        borderRadius: '1rem', 
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    align="center"
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[9px] font-bold text-[var(--color-brand-secondary)] uppercase tracking-widest">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    color: 'red' | 'emerald' | 'blue' | 'amber';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, trend, color }) => (
    <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/5 space-y-4 hover:bg-white/5 transition-all group">
        <div className="flex items-center justify-between">
            <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                color === 'red' ? "bg-red-400/10" : 
                color === 'emerald' ? "bg-emerald-400/10" : 
                color === 'blue' ? "bg-blue-400/10" : "bg-amber-400/10"
            )}>
                {icon}
            </div>
            <span className={cn(
                "text-[8px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg bg-white/5 whitespace-nowrap",
                color === 'red' ? "text-red-400" : 
                color === 'emerald' ? "text-emerald-400" : 
                color === 'blue' ? "text-blue-400" : "text-amber-400"
            )}>
                {trend}
            </span>
        </div>
        <div>
            <p className="text-[8px] md:text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                {title}
            </p>
            <p className="text-sm md:text-2xl font-black mt-1 flex items-baseline gap-1 flex-wrap">
                {typeof value === 'number' ? value.toLocaleString('en-EU', { minimumFractionDigits: 2 }) : value}
                {typeof value === 'number' && <span className="text-[10px] md:text-sm opacity-50">EUR</span>}
            </p>
        </div>
    </div>
);
