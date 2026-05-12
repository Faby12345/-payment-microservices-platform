import React, { useState } from 'react';
import { IconGrid, IconCopy, IconCheck, IconSend, IconChartBar } from '../../components/ui/Icons';
import { cn } from '../../utils/cn';

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 font-mono text-sm leading-relaxed">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">{language}</span>
                <button 
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-[var(--color-brand-secondary)] hover:text-white"
                >
                    {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto no-scrollbar text-[var(--color-brand-accent-light)]">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export const HubPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'guide' | 'reference' | 'endpoints'>('guide');

    return (
        <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
            {/* --- Header Section --- */}
            <header className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-accent)]/20 flex items-center justify-center border border-[var(--color-brand-accent)]/20">
                        <IconGrid className="w-6 h-6 text-[var(--color-brand-accent)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight gradient-text">SecurePay Developer Hub</h1>
                        <p className="text-[var(--color-brand-secondary)] font-medium">Build next-gen payment experiences with our Currency API.</p>
                    </div>
                </div>
                
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
                    {(['guide', 'endpoints', 'reference'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                                activeTab === tab 
                                    ? "bg-[var(--color-brand-accent)] text-white shadow-glow-sm" 
                                    : "text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'guide' && (
                <div className="space-y-8 animate-slide-up">
                    <section className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[var(--color-brand-accent)]/10 flex items-center justify-center text-[var(--color-brand-accent)] text-sm">1</span>
                            Authentication
                        </h3>
                        <p className="text-[var(--color-brand-secondary)] leading-relaxed">
                            All API requests must be authenticated using a Bearer Token provided during the login process. Include this token in the <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">Authorization</code> header.
                        </p>
                        <CodeBlock 
                            language="HTTP"
                            code={`Authorization: Bearer <your_jwt_token>`}
                        />
                    </section>

                    <section className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[var(--color-brand-accent)]/10 flex items-center justify-center text-[var(--color-brand-accent)] text-sm">2</span>
                            Quick Start
                        </h3>
                        <p className="text-[var(--color-brand-secondary)] leading-relaxed">
                            Get your current wallet balance and account information in seconds using your User ID.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase ml-2">Using cURL</span>
                                <CodeBlock 
                                    language="bash"
                                    code={`curl -X GET "https://api.securepay.com/api/wallets/user/123" \\
     -H "Authorization: Bearer <token>"`}
                                />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase ml-2">Using JavaScript</span>
                                <CodeBlock 
                                    language="javascript"
                                    code={`const response = await fetch('/api/wallets/user/123', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});
const data = await response.json();`}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'endpoints' && (
                <div className="space-y-6 animate-slide-up">
                    <div className="glass-card p-6 rounded-[2rem] border border-white/5 group hover:border-[var(--color-brand-accent)]/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg border border-green-500/20">GET</span>
                                <code className="text-sm font-bold text-white">/api/wallets/user/&#123;userId&#125;</code>
                            </div>
                            <span className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">Wallet Data</span>
                        </div>
                        <p className="text-sm text-[var(--color-brand-secondary)] mb-6">Retrieves the primary wallet and all associated currency accounts for the specified user.</p>
                        
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Parameters</h4>
                            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-mono text-[var(--color-brand-accent-light)]">userId</span>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-[var(--color-brand-secondary)]">PATH | UUID</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] border border-white/5 group hover:border-[var(--color-brand-accent)]/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-lg border border-blue-500/20">POST</span>
                                <code className="text-sm font-bold text-white">/api/wallets/&#123;walletId&#125;/accounts</code>
                            </div>
                            <span className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase">Create Account</span>
                        </div>
                        <p className="text-sm text-[var(--color-brand-secondary)] mb-6">Provisions a new currency sub-account within the specified wallet.</p>
                    </div>
                </div>
            )}

            {activeTab === 'reference' && (
                <div className="space-y-8 animate-slide-up">
                    <section className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <header className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Expected Response</h3>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-black">200 OK</span>
                        </header>
                        <CodeBlock 
                            language="json"
                            code={`{
  "id": "w_91238475",
  "userId": "u_012934",
  "accounts": [
    {
      "id": "acc_0123",
      "currency": "EUR",
      "balance": 1250.50,
      "iban": "RO09 SPAY 4000 1234 5678 0001",
      "status": "ACTIVE"
    },
    {
      "id": "acc_0124",
      "currency": "USD",
      "balance": 450.00,
      "iban": "US88 SPAY 1000 9876 5432 0002",
      "status": "ACTIVE"
    }
  ],
  "createdAt": "2024-05-12T10:00:00Z"
}`}
                        />
                    </section>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-4">
                            <IconChartBar className="w-8 h-8 text-[var(--color-brand-accent)]" />
                            <h4 className="font-bold">Real-time Rates</h4>
                            <p className="text-sm text-[var(--color-brand-secondary)] leading-relaxed">Balances are automatically calculated against real-time mid-market rates for the Global view.</p>
                        </div>
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-4">
                            <IconSend className="w-8 h-8 text-[var(--color-brand-accent)]" />
                            <h4 className="font-bold">Instant Settlements</h4>
                            <p className="text-sm text-[var(--color-brand-secondary)] leading-relaxed">Wallet transactions are processed through our internal ledger for zero-latency settlements.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
