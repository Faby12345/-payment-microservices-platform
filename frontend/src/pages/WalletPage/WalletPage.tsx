import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
    getWalletData, 
    getTransactionHistory 
} from '../../services/walletService';
import { 
    type WalletResponse, 
    type TransactionResponse,
    type PaginatedResponse
} from '../../types/wallet.types';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { OverviewPage } from '../OverviewPage/OverviewPage';
import { PaymentsPage } from '../PaymentsPage/PaymentsPage';
import { MarketsPage } from '../MarketsPage/MarketsPage';
import { CurrencyDetailsPage } from '../MarketsPage/CurrencyDetailsPage';
import { StatsPage } from '../StatsPage/StatsPage';
import { HubPage } from '../HubPage/HubPage';

export const WalletPage: React.FC = () => {
    const { user } = useAuth();
    
    // Data State
    const [wallet, setWallet] = useState<WalletResponse | null>(null);
    const [transactionsPage, setTransactionsPage] = useState<PaginatedResponse<TransactionResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [showAddAccount, setShowAddAccount] = useState(false);
    
    // Pagination & Filter State
    const [currentPage, setCurrentPage] = useState(0);
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchDashboardData = useCallback(async (showLoading = true) => {
        if (!user?.id) return;
        
        try {
            if (showLoading) setIsLoading(true);
            const [walletData, txPage] = await Promise.all([
                getWalletData(user.id),
                getTransactionHistory(user.id, currentPage, 10, filterType, filterStatus)
            ]);
            setWallet(walletData);
            setTransactionsPage(txPage);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [user?.id, currentPage, filterType, filterStatus]);

    useEffect(() => {
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    const handleRefresh = (page?: number, type?: string, status?: string) => {
        if (page !== undefined) setCurrentPage(page);
        if (type !== undefined) {
            setFilterType(type);
            setCurrentPage(0); // Reset to first page on filter change
        }
        if (status !== undefined) {
            setFilterStatus(status);
            setCurrentPage(0); // Reset to first page on filter change
        }
        
        // Manual refresh (e.g. after adding account)
        if (page === undefined && type === undefined && status === undefined) {
            fetchDashboardData(false);
        }
    };

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
            <Route element={
                <DashboardLayout 
                    wallet={wallet} 
                    selectedAccountId={selectedAccountId}
                    onAccountSelect={setSelectedAccountId}
                    onRefresh={() => handleRefresh()}
                    showAddAccount={showAddAccount}
                    setShowAddAccount={setShowAddAccount}
                />
            }>
                <Route index element={<Navigate to="./dashboard" replace />} />
                <Route path="dashboard" element={
                    <OverviewPage 
                        totalBalance={totalBalance} 
                        transactionsPage={transactionsPage} 
                        wallet={wallet}
                        selectedAccountId={selectedAccountId}
                        onRefresh={handleRefresh}
                        onAddAccount={() => setShowAddAccount(true)}
                        filterType={filterType}
                        filterStatus={filterStatus}
                    />
                } />
                <Route path="payments" element={
                    <PaymentsPage 
                        wallet={wallet} 
                        totalBalance={totalBalance} 
                        onRefresh={() => handleRefresh()} 
                    />
                } />
                <Route path="markets" element={<MarketsPage />} />
                <Route path="markets/:currency" element={<CurrencyDetailsPage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="hub" element={<HubPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="./dashboard" replace />} />
            </Route>
        </Routes>
    );
};
