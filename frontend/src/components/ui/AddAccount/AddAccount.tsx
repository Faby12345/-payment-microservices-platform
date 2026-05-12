import React, { useState } from 'react';
import { IconPlus, IconAlert } from '../Icons';
import { cn } from '../../../utils/cn';
import { createAccount } from '../../../services/walletService';

interface AddAccountProps {
    walletId: string;
    onClose: () => void;
    onRefresh: () => void;
}

export const AddAccount: React.FC<AddAccountProps> = ({ walletId, onClose, onRefresh }) => {
    const [currency, setCurrency] = useState('EUR');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currencies = [
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
        { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
        { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
        { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
        { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
        { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            await createAccount(walletId, { currency });
            onRefresh();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-slide-up w-full max-w-2xl mx-auto">
            <div className="glass-card rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-glow-sm relative overflow-hidden border border-white/5">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold gradient-text">New Account</h2>
                        <p className="text-[var(--color-brand-secondary)] text-xs md:text-sm mt-1">
                            Add a new currency account to your wallet.
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--color-brand-secondary)]"
                    >
                        <svg className="w-5 h-5 md:w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    <label className="text-[10px] md:text-xs font-semibold text-[var(--color-brand-secondary)] uppercase tracking-wider block ml-1">
                        Select Currency
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        {currencies.map((curr) => (
                            <button
                                key={curr.code}
                                type="button"
                                onClick={() => setCurrency(curr.code)}
                                className={cn(
                                    "p-3 md:p-4 rounded-xl md:rounded-2xl border text-left transition-all duration-300 flex items-center gap-2 md:gap-3",
                                    currency === curr.code 
                                        ? "glow-border bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)]/30" 
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="text-xl md:text-2xl">{curr.flag}</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-xs md:text-sm">{curr.code}</span>
                                    <span className="text-[9px] md:text-[10px] text-[var(--color-brand-secondary)]">{curr.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl bg-[var(--color-brand-error)]/10 border border-[var(--color-brand-error)]/20 flex items-start gap-2 md:gap-3">
                        <IconAlert className="w-4 h-4 md:w-5 h-5 text-[var(--color-brand-error)] shrink-0" />
                        <span className="text-xs md:text-sm text-[var(--color-brand-error)]">{error}</span>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-glow text-sm md:text-base",
                        isLoading 
                            ? "bg-white/10 text-white/20 cursor-not-allowed" 
                            : "bg-[var(--color-brand-accent)] text-white hover:shadow-[var(--color-brand-accent)]/20 active:scale-95"
                    )}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <IconPlus className="w-5 h-5" />
                    )}
                    {isLoading ? 'Creating...' : 'Create Account'}
                </button>
            </div>
        </form>
    );
};
