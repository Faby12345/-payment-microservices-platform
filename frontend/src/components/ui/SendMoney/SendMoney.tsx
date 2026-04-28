import React, { useState } from 'react';
import { IconSend, IconUser, IconCreditCard, IconPlus, IconGrid } from '../Icons';
import { cn } from '../../../utils/cn';

interface SendMoneyProps {
    onClose: () => void;
    accounts: Array<{ id: string; balance: number; currency: string; type: string }>;
}

type TransferType = 'friend' | 'iban';

export const SendMoney: React.FC<SendMoneyProps> = ({ onClose, accounts }) => {
    const [mode, setMode] = useState<TransferType>('friend');
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    
    // IBAN specific fields
    const [iban, setIban] = useState('');
    const [bic, setBic] = useState('');
    const [recipientName, setRecipientName] = useState('');

    const recentRecipients = [
        { id: '1', name: 'Alex Rivera', initial: 'A', color: 'bg-blue-500' },
        { id: '2', name: 'Sarah Chen', initial: 'S', color: 'bg-emerald-500' },
        { id: '3', name: 'Marcus Bell', initial: 'M', color: 'bg-amber-500' },
        { id: '4', name: 'Jade West', initial: 'J', color: 'bg-purple-500' },
    ];

    const currentAccount = accounts.find(a => a.id === selectedAccount);
    const isOverBalance = currentAccount ? parseFloat(amount) > currentAccount.balance : false;
    
    // Logic for fees and delivery based on mode
    const isIban = mode === 'iban';
    const feePercentage = isIban ? 0.025 : 0.01; // IBAN has higher fee
    const fee = amount ? (parseFloat(amount) * feePercentage).toFixed(2) : '0.00';
    const total = amount ? (parseFloat(amount) + parseFloat(fee)).toFixed(2) : '0.00';
    const deliveryTime = isIban ? '1-2 Business Days' : 'Instant';


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // This is where you would call your API service
        const formData = {
            mode,
            fromAccountId: selectedAccount,
            amount: parseFloat(amount),
            recipient: mode === 'friend' ? recipient : { recipientName, iban, bic },
            fee,
            total
        };

        console.log("Form Submitted Successfully:", formData);
        alert(`Transfer of ${amount} ${currentAccount?.currency} to ${mode === 'friend' ? recipient : recipientName} initiated!`);
        onClose();
    };


    return (
        <form onSubmit={handleSubmit} className="animate-slide-up w-full">
            <div className="glass-card rounded-[var(--radius-card)] p-8 shadow-glow-sm relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--color-brand-accent)]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Send Money</h2>
                        <p className="text-[var(--color-brand-secondary)] text-sm mt-1">
                            {isIban ? 'Transfer to any bank account worldwide.' : 'Send funds instantly to friends on SecurePay.'}
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--color-brand-secondary)]"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                    <button 
                        type="button"
                        onClick={() => setMode('friend')}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            mode === 'friend' ? "bg-[var(--color-brand-accent)] text-white shadow-glow-sm" : "text-[var(--color-brand-secondary)] hover:text-white"
                        )}
                    >
                        <IconUser className="w-4 h-4" />
                        To Friend
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('iban')}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            mode === 'iban' ? "bg-[var(--color-brand-accent)] text-white shadow-glow-sm" : "text-[var(--color-brand-secondary)] hover:text-white"
                        )}
                    >
                        <IconGrid className="w-4 h-4" />
                        Via IBAN
                    </button>
                </div>

                {/* 1. Source Account Selection */}
                <div className="mb-8">
                    <label className="text-xs font-semibold text-[var(--color-brand-secondary)] uppercase tracking-wider mb-4 block">
                        From Account
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {accounts.map((acc) => (
                            <button
                                key={acc.id}
                                type="button"
                                onClick={() => setSelectedAccount(acc.id)}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                                    selectedAccount === acc.id 
                                        ? "glow-border bg-[var(--color-brand-accent)]/10 border-transparent" 
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <span className="text-xs font-medium opacity-60 uppercase">{acc.type}</span>
                                    <IconCreditCard className={cn("w-4 h-4", selectedAccount === acc.id ? "text-[var(--color-brand-accent)]" : "text-white/40")} />
                                </div>
                                <div className="text-lg font-bold relative z-10">
                                    {acc.balance.toLocaleString('en-US', { style: 'currency', currency: acc.currency })}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Recipient Section */}
                <div className="mb-8">
                    <label className="text-xs font-semibold text-[var(--color-brand-secondary)] uppercase tracking-wider mb-4 block">
                        Recipient Details
                    </label>
                    
                    {mode === 'friend' ? (
                        <div className="space-y-6">
                            {/* Recent Recipients */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                <button type="button" className="flex-shrink-0 flex flex-col items-center gap-2 group">
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-[var(--color-brand-accent)] group-hover:text-[var(--color-brand-accent)] transition-all">
                                        <IconPlus className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-[var(--color-brand-secondary)]">New</span>
                                </button>
                                {recentRecipients.map((r) => (
                                    <button 
                                        key={r.id} 
                                        type="button"
                                        onClick={() => setRecipient(r.name)}
                                        className="flex-shrink-0 flex flex-col items-center gap-2 group"
                                    >
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110", r.color)}>
                                            {r.initial}
                                        </div>
                                        <span className="text-[10px] text-[var(--color-brand-secondary)] group-hover:text-white transition-colors truncate w-14 text-center">
                                            {r.name.split(' ')[0]}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <IconUser className="h-5 w-5 text-white/20" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Email, phone or wallet address"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="input-base pl-12 pt-4 pb-4 h-14"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="absolute top-2 left-4 text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">Recipient Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="input-base pt-8 pb-4 h-16"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 relative">
                                    <label className="absolute top-2 left-4 text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">IBAN</label>
                                    <input
                                        type="text"
                                        placeholder="DE00 0000 0000 ..."
                                        value={iban}
                                        onChange={(e) => {
                                            // Remove spaces, uppercase, and limit to 34 chars (max IBAN length)
                                            const rawValue = e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 34);
                                            // Add space every 4 characters
                                            const formattedValue = rawValue.match(/.{1,4}/g)?.join(' ') || rawValue;
                                            setIban(formattedValue);
                                        }}
                                        className="input-base pt-8 pb-4 h-16 tracking-widest font-mono text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="absolute top-2 left-4 text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">BIC / SWIFT</label>
                                    <input
                                        type="text"
                                        placeholder="OPTIONAL"
                                        value={bic}
                                        onChange={(e) => setBic(e.target.value.toUpperCase())}
                                        className="input-base pt-8 pb-4 h-16 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Amount Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2 relative">
                        <label className={cn(
                            "absolute top-2 left-4 text-[10px] font-bold uppercase transition-colors",
                            isOverBalance ? "text-[var(--color-brand-error)]" : "text-[var(--color-brand-secondary)]"
                        )}>
                            Amount
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={cn(
                                "input-base pt-8 pb-4 h-20 text-3xl font-bold transition-all",
                                isOverBalance && "border-[var(--color-brand-error)] text-[var(--color-brand-error)] animate-shake shadow-[0_0_20px_rgba(255,77,106,0.1)]"
                            )}
                        />
                        <button 
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)] text-xs font-bold hover:bg-[var(--color-brand-accent)] hover:text-white transition-all"
                            onClick={() => setAmount(currentAccount?.balance.toString() || '0')}
                        >
                            MAX
                        </button>
                        {isOverBalance && (
                            <div className="absolute -bottom-6 left-0 text-[var(--color-brand-error)] text-[10px] font-bold uppercase tracking-widest animate-fade-in">
                                Insufficient funds in selected account
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <label className="absolute top-2 left-4 text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">
                            Currency
                        </label>
                        <div className="input-base pt-8 pb-4 h-20 flex items-center text-xl font-bold bg-white/5 border-white/10 opacity-60">
                            {currentAccount?.currency || 'USD'}
                        </div>
                    </div>
                </div>

                {/* 4. Transaction Summary */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-brand-secondary)]">Estimated Delivery</span>
                            <span className="font-bold text-[var(--color-brand-accent-light)]">{deliveryTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-brand-secondary)]">Processing Fee ({isIban ? '2.5%' : '1%'})</span>
                            <span className="font-medium text-[var(--color-brand-warning)]">{fee} {currentAccount?.currency}</span>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                            <span className="text-sm font-bold uppercase tracking-wider">Total to Deduct</span>
                            <span className="text-2xl font-black text-[var(--color-brand-success)]">
                                {total} {currentAccount?.currency}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 5. Action Button */}
                <button 
                    type="submit"
                    disabled={!amount || isOverBalance || (mode === 'friend' ? !recipient : !iban || !recipientName)}
                    className={cn(
                        "w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-glow",
                        (!amount || isOverBalance || (mode === 'friend' ? !recipient : !iban || !recipientName))
                            ? "bg-white/10 text-white/20 cursor-not-allowed"
                            : "bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent-light)] active:scale-[0.98]"
                    )}
                >
                    <IconSend className="w-5 h-5" />
                    Confirm & Send
                </button>
            </div>
        </form>
    );
};
