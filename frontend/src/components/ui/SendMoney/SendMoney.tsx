import React, { useState } from 'react';
import { IconSend, IconUser, IconCreditCard, IconPlus, IconGrid, IconAlert } from '../Icons';
import { cn } from '../../../utils/cn';
import type {TransferRequest} from "../../../types/transfer.types";
import {submitTransfer} from "../../../services/transferService";

interface SendMoneyProps {
    onClose: () => void;
    onRefresh?: () => void;
    accounts: Array<{ id: string; balance: number; currency: string; type: string }>;
}

type TransferType = 'friend' | 'iban';

export const SendMoney: React.FC<SendMoneyProps> = ({ onClose, onRefresh, accounts }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<TransferType>('iban');
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    
    // IBAN specific fields
    const [iban, setIban] = useState('');
    const [bic, setBic] = useState('');
    const [recipientName, setRecipientName] = useState('');

    const currentAccount = accounts.find(a => a.id === selectedAccount);

    const isIban = mode === 'iban';
    const feePercentage = isIban ? 0.025 : 0.01;
    const fee = amount ? (parseFloat(amount) * feePercentage).toFixed(2) : '0.00';
    const total = amount ? (parseFloat(amount) + parseFloat(fee)).toFixed(2) : '0.00';
    const isOverBalance = currentAccount ? parseFloat(total) > currentAccount.balance : false;

    const deliveryTime = isIban ? '1-2 Business Days' : 'Instant';

    const recentRecipients = [
        { id: '1', name: 'Alex Rivera', initial: 'A', color: 'bg-blue-500' },
        { id: '2', name: 'Sarah Chen', initial: 'S', color: 'bg-emerald-500' },
        { id: '3', name: 'Marcus Bell', initial: 'M', color: 'bg-amber-500' },
        { id: '4', name: 'Jade West', initial: 'J', color: 'bg-purple-500' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const request : TransferRequest = {
            fromAccountId: selectedAccount,
            amount: parseFloat(amount),
            currency: currentAccount?.currency || 'USD',
            type: mode === 'friend' ? 'INTERNAL' : 'EXTERNAL',
            recipientIdentifier: mode === 'friend' ? recipient : iban?.replace(/\s/g, ''),
            recipientName: mode === 'iban' ? recipientName : undefined,
            iban: mode === 'iban' ? iban?.replace(/\s/g, '') : undefined,
            bic: mode === 'iban' ? bic : undefined,
            description: `Transfer to ${mode === 'friend' ? recipient : recipientName}`
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

    return (
        <div className="animate-slide-up w-full max-w-2xl mx-auto ">
            <div className="glass-card rounded-[2.5rem] p-10 pb-20 shadow-glow-sm relative overflow-hidden border border-white/5">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--color-brand-accent)]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {step === 2 && (
                            <button 
                                onClick={() => {
                                    setStep(1);
                                    setError(null);
                                }}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--color-brand-secondary)] hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold gradient-text">
                                {step === 1 ? 'Select Account' : 'Transfer Details'}
                            </h2>
                            <p className="text-[var(--color-brand-secondary)] text-xs mt-1 uppercase tracking-widest font-bold opacity-60">
                                Step {step} of 2
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--color-brand-secondary)]"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative overflow-visible min-h-[500px]">
                    {/* STEP 1: ACCOUNT SELECTION */}
                    <div className={cn(
                        "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] absolute inset-0 py-2 px-1",
                        step === 1 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
                    )}>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.2em] mb-4 block ml-1">
                                Choose Source Fund
                            </label>
                            <div className="grid grid-cols-1 gap-4">
                                {accounts.map((acc) => (
                                    <button
                                        key={acc.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedAccount(acc.id);
                                            setStep(2);
                                        }}
                                        className={cn(
                                            "p-7 rounded-[2rem] border text-left transition-all duration-300 relative overflow-hidden group flex items-center justify-between",
                                            selectedAccount === acc.id 
                                                ? "glow-border bg-[var(--color-brand-accent)]/10 border-transparent shadow-glow-sm scale-[1.02] z-10" 
                                                : "bg-white/5 border-white/10 hover:border-white/20 hover:scale-[1.01]"
                                        )}
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors",
                                                selectedAccount === acc.id ? "bg-[var(--color-brand-accent)] text-white" : "bg-white/5 text-white/40"
                                            )}>
                                                {acc.currency === 'EUR' ? '🇪🇺' : acc.currency === 'USD' ? '🇺🇸' : acc.currency === 'GBP' ? '🇬🇧' : '🇷🇴'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-tighter mb-1">
                                                    {acc.currency} Account
                                                </span>
                                                <span className="text-xl font-black">
                                                    {acc.currency === 'EUR' ? '€' : acc.currency === 'USD' ? '$' : acc.currency === 'GBP' ? '£' : 'lei'}
                                                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-6 h-6 text-[var(--color-brand-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: RECIPIENT & AMOUNT */}
                    <form 
                        onSubmit={handleSubmit}
                        className={cn(
                            "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] absolute inset-0 pb-12",
                            step === 2 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                        )}
                    >
                        <div className="space-y-6">
                            {/* Selected Account Summary */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{currentAccount?.currency === 'EUR' ? '🇪🇺' : currentAccount?.currency === 'USD' ? '🇺🇸' : '🇬🇧'}</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-[var(--color-brand-secondary)] font-bold uppercase tracking-tighter">From Account</span>
                                        <span className="text-sm font-bold">{currentAccount?.currency} • {currentAccount?.balance.toLocaleString()} available</span>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-[var(--color-brand-accent)] text-[10px] font-black uppercase hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            {/* Recipient Section */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="absolute top-2 left-4 text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">Recipient Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={recipientName}
                                        onChange={(e) => {
                                            setRecipientName(e.target.value);
                                            setError(null);
                                        }}
                                        className="input-base pt-8 pb-4 h-16"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="absolute top-2 left-4 text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">IBAN</label>
                                    <input
                                        type="text"
                                        placeholder="DE00 0000 0000 ..."
                                        value={iban}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 34);
                                            const formattedValue = rawValue.match(/.{1,4}/g)?.join(' ') || rawValue;
                                            setIban(formattedValue);
                                            setError(null);
                                        }}
                                        className="input-base pt-8 pb-4 h-16 tracking-widest font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {/* Amount Section */}
                            <div className="relative">
                                <label className={cn(
                                    "absolute top-2 left-4 text-[10px] font-bold uppercase transition-colors",
                                    isOverBalance ? "text-[var(--color-brand-error)]" : "text-[var(--color-brand-secondary)]"
                                )}>
                                    Amount to Send ({currentAccount?.currency})
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setError(null);
                                    }}
                                    className={cn(
                                        "input-base pt-8 pb-4 h-20 text-3xl font-bold",
                                        isOverBalance && "border-[var(--color-brand-error)] text-[var(--color-brand-error)]"
                                    )}
                                />
                                {isOverBalance && (
                                    <div className="absolute -bottom-5 left-0 text-[var(--color-brand-error)] text-[10px] font-bold uppercase tracking-widest">
                                        Insufficient funds
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-brand-secondary)]">Fee ({feePercentage * 100}%)</span>
                                    <span>{fee} {currentAccount?.currency}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t border-white/5">
                                    <span className="uppercase tracking-widest">Total</span>
                                    <span className="text-[var(--color-brand-success)] text-sm">{total} {currentAccount?.currency}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-[var(--color-brand-error)]/10 border border-[var(--color-brand-error)]/20 flex items-start gap-3">
                                    <IconAlert className="w-5 h-5 text-[var(--color-brand-error)] shrink-0 mt-0.5" />
                                    <div className="text-sm text-[var(--color-brand-error)] font-medium">{error}</div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading || !amount || isOverBalance || !iban || !recipientName}
                                className={cn(
                                    "w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-glow p-4",
                                    (isLoading || !amount || isOverBalance || !iban || !recipientName)
                                        ? "bg-white/10 text-white/20 cursor-not-allowed"
                                        : "bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent-light)] shadow-[0_10px_30px_rgba(13,148,136,0.3)]"
                                )}
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <IconSend className="w-5 h-5" />
                                )}
                                {isLoading ? 'Processing...' : 'Confirm & Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
