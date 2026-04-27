import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
    getWalletData, 
    getTransactionHistory 
} from '../../services/walletService';
import { 
    type WalletResponse, 
    type TransactionResponse 
} from '../../types/wallet.types';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { OverviewPage } from '../OverviewPage/OverviewPage';
import { PaymentsPage } from '../PaymentsPage/PaymentsPage';
import { CardsPage } from '../CardsPage/CardsPage';
import { StatsPage } from '../StatsPage/StatsPage';
import { HubPage } from '../HubPage/HubPage';

export const WalletPage: React.FC = () => {
    const { user } = useAuth();
    
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

    if (isLoading && !wallet) {
        return (
            <div className="min-h-screen bg-[var(--color-brand-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route element={<DashboardLayout wallet={wallet} />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<OverviewPage totalBalance={totalBalance} transactions={transactions} />} />
                <Route path="payments" element={<PaymentsPage wallet={wallet} totalBalance={totalBalance} />} />
                <Route path="cards" element={<CardsPage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="hub" element={<HubPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};
