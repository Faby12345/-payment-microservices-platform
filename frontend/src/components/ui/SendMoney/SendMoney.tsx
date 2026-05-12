import React, { useState } from 'react';
import { IconSend, IconCreditCard, IconAlert, IconExchange } from '../Icons';
import { cn } from '../../../utils/cn';
import type {TransferRequest} from "../../../types/transfer.types";
import {submitTransfer} from "../../../services/transferService";

interface SendMoneyProps {
    onClose: () => void;
    onRefresh: (page?: number) => void;
    accounts: Array<{ id: string; balance: number; currency: string; type: string }>;
}

export const SendMoney: React.FC<SendMoneyProps> = ({ onClose, onRefresh, accounts }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
    const [amount, setAmount] = useState('');
    
    const [iban, setIban] = useState('');
    const [recipientName, setRecipientName] = useState('');

    const currentAccount = accounts.find(a => a.id === selectedAccount);

    const feePercentage = 0.025;
    const fee = amount ? (parseFloat(amount) * feePercentage).toFixed(2) : '0.00';
    const total = amount ? (parseFloat(amount) + parseFloat(fee)).toFixed(2) : '0.00';
    const isOverBalance = currentAccount ? parseFloat(total) > currentAccount.balance : false;
    const isNegativeBalance = parseFloat(total) < 0 || parseFloat(amount) < 0 ? true : false;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const request : TransferRequest = {
            fromAccountId: selectedAccount,
            amount: parseFloat(amount),
            currency: currentAccount?.currency || 'USD',
            type: 'EXTERNAL',
            recipientIdentifier: iban?.replace(/\s/g, ''),
            recipientName: recipientName,
            iban: iban?.replace(/\s/g, ''),
            description: `Transfer to ${recipientName}`
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await submitTransfer(request);
            if (onRefresh) setTimeout(() => onRefresh(), 1000);
            alert(`Transfer Successful: ${response.message}`);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const getFlag = (currency: string) => {
        switch (currency) {
            case 'EUR': return '🇪🇺';
            case 'USD': return '🇺🇸';
            case 'GBP': return '🇬🇧';
            case 'RON': return '🇷🇴';
            default: return '🏳️';
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in relative min-h-[600px]">
            {/* --- STEP 1: ACCOUNT SELECTION --- */}
            <div className={cn(
                "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                step === 1 ? "translate-x-0 opacity-100 block" : "-translate-x-12 opacity-0 hidden"
            )}>
                <div className="space-y-6">
                    <div className="text-center space-y-2 mb-10">
                        <h2 className="text-3xl font-black tracking-tight">Select <span className="gradient-text">Source</span></h2>
                        <p className="text-[var(--color-brand-secondary)] text-sm font-medium">Which account would you like to send from?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {accounts.map((acc) => (
                            <button
                                key={acc.id}
                                type="button"
                                onClick={() => {
                                    setSelectedAccount(acc.id);
                                    setStep(2);
                                }}
                                className="group p-8 rounded-[2.5rem] glass-card border border-white/5 hover:border-[var(--color-brand-accent)]/40 hover:bg-white/[0.03] transition-all duration-500 text-left flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                        {getFlag(acc.currency)}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.2em]">{acc.currency} Account</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black tabular-nums tracking-tighter">
                                                {acc.currency === 'EUR' ? '€' : acc.currency === 'USD' ? '$' : acc.currency === 'GBP' ? '£' : 'lei'}
                                                {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-brand-accent)] group-hover:border-transparent transition-all">
                                    <svg className="w-5 h-5 text-white/20 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- STEP 2: TRANSFER DETAILS --- */}
            <div className={cn(
                "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                step === 2 ? "translate-x-0 opacity-100 block" : "translate-x-12 opacity-0 hidden"
            )}>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Premium Selected Account Card */}
                    <div className="relative group overflow-hidden rounded-[2.5rem] p-1 border border-[var(--color-brand-accent)]/20 shadow-glow-sm">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[var(--color-brand-accent)]/10 blur-[60px] rounded-full" />
                        <div className="bg-[#0A0A0B]/80 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-8 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[var(--color-brand-accent)] to-[var(--color-brand-accent-light)] flex items-center justify-center text-4xl shadow-glow-sm">
                                    {getFlag(currentAccount?.currency || '')}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-[var(--color-brand-accent)] uppercase tracking-[0.2em]">Source Active</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)] animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-black tracking-tight">{currentAccount?.currency} Account</h4>
                                    <p className="text-xs text-[var(--color-brand-secondary)] font-medium">
                                        Balance: {currentAccount?.currency === 'EUR' ? '€' : '$'}{currentAccount?.balance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex flex-col items-center gap-1 group/btn"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/btn:bg-white/10 transition-all">
                                    <IconExchange className="w-4 h-4 text-[var(--color-brand-secondary)] group-hover/btn:text-white" />
                                </div>
                                <span className="text-[9px] font-black text-[var(--color-brand-secondary)] uppercase group-hover/btn:text-white">Switch</span>
                            </button>
                        </div>
                    </div>

                    {/* Inputs Card */}
                    <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-2">Recipient Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:border-[var(--color-brand-accent)]/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-2">IBAN / Account</label>
                                <input
                                    type="text"
                                    placeholder="RO00 BANK 0000 ..."
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-mono font-bold tracking-wider focus:border-[var(--color-brand-accent)]/50 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest ml-2 transition-colors",
                                isOverBalance ? "text-red-400" : "text-[var(--color-brand-secondary)]"
                            )}>
                                Amount to Send
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={cn(
                                        "w-full h-20 bg-white/5 border border-white/5 rounded-3xl px-8 text-4xl font-black tabular-nums focus:border-[var(--color-brand-accent)]/50 outline-none transition-all",
                                        isOverBalance && "border-red-400/50 text-red-400",

                                    )}
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-2xl text-[var(--color-brand-secondary)]">
                                    {currentAccount?.currency}
                                </span>
                            </div>
                        </div>

                        {/* Summary Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest block">Transaction Fee (2.5%)</span>
                                <span className="text-sm font-bold">{fee} {currentAccount?.currency}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest block">Total Deducted</span>
                                <span className={cn(
                                    "text-2xl font-black tracking-tighter tabular-nums",
                                    isOverBalance || isNegativeBalance ? "text-red-400" : "gradient-text",

                                )}>
                                    {total} {currentAccount?.currency}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-start gap-3 animate-shake">
                                <IconAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <span className="text-xs text-red-400 font-bold leading-relaxed">{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading || !amount || isOverBalance || !iban || !recipientName}
                            className={cn(
                                "w-full h-18 py-5 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500",
                                (isLoading || !amount || isOverBalance || !iban || !recipientName)
                                    ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                    : "bg-[var(--color-brand-accent)] text-white shadow-glow hover:bg-[var(--color-brand-accent-light)] hover:-translate-y-1 active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <IconSend className="w-4 h-4" />
                                    Confirm & Send
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
