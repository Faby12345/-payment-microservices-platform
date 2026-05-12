import React, { useState } from 'react';
import { 
    IconGrid, 
    IconCopy, 
    IconCheck, 
    IconChartBar, 
    IconHome,
} from '../../components/ui/Icons';
import { cn } from '../../utils/cn';

type DocSection = 'intro' | 'wallet-get' | 'wallet-create' | 'rates-euro' | 'rates-all' | 'rates-history';

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
                <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-[var(--color-brand-secondary)]">
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
    const [activeSection, setActiveSection] = useState<DocSection>('intro');
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['wallet', 'market']);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleFolder = (folder: string) => {
        setExpandedFolders(prev => 
            prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
        );
    };

    const handleSectionChange = (id: DocSection) => {
        setActiveSection(id);
        setIsMobileMenuOpen(false);
        // Scroll slightly above the mobile sticky header
        if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const NavItem: React.FC<{ id: DocSection; label: string; icon?: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => handleSectionChange(id)}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold transition-all text-left",
                activeSection === id 
                    ? "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/20 shadow-glow-sm" 
                    : "text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5"
            )}
        >
            {icon && <span className="opacity-70">{icon}</span>}
            <span className="truncate">{label}</span>
        </button>
    );

    const NavigationContent = () => (
        <nav className="space-y-1">
            <NavItem id="intro" label="Introduction" icon={<IconHome className="w-4 h-4" />} />
            
            <div className="pt-4">
                <button 
                    onClick={() => toggleFolder('wallet')}
                    className="flex items-center gap-2 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors w-full"
                >
                    <span className={cn("transition-transform duration-200", expandedFolders.includes('wallet') ? "rotate-90" : "")}>▶</span>
                    Wallet API
                </button>
                {expandedFolders.includes('wallet') && (
                    <div className="mt-2 ml-4 space-y-1 border-l border-white/5 pl-2 animate-slide-up">
                        <NavItem id="wallet-get" label="Retrieve Wallet" />
                        <NavItem id="wallet-create" label="Add Account" />
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button 
                    onClick={() => toggleFolder('market')}
                    className="flex items-center gap-2 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors w-full"
                >
                    <span className={cn("transition-transform duration-200", expandedFolders.includes('market') ? "rotate-90" : "")}>▶</span>
                    Market Data
                </button>
                {expandedFolders.includes('market') && (
                    <div className="mt-2 ml-4 space-y-1 border-l border-white/5 pl-2 animate-slide-up">
                        <NavItem id="rates-euro" label="EUR Base Rates" />
                        <NavItem id="rates-all" label="Global Rates (BNR)" />
                        <NavItem id="rates-history" label="Rate History" />
                    </div>
                )}
            </div>
        </nav>
    );

    const activeLabel = {
        'intro': 'Introduction',
        'wallet-get': 'Retrieve Wallet',
        'wallet-create': 'Add Account',
        'rates-euro': 'EUR Base Rates',
        'rates-all': 'Global Rates (BNR)',
        'rates-history': 'Rate History'
    }[activeSection];

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in max-w-6xl mx-auto relative px-2">
            
            {/* --- Mobile Navigation Header --- */}
            {/* top-0 is already sticky in DashboardLayout for the main header, 
                so we use top-[72px] to stack below it. */}
            <div className="lg:hidden sticky top-[72px] z-20 -mx-2 px-2 py-4 bg-[var(--color-brand-bg)]/95 backdrop-blur-xl border-b border-white/5">
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-left active:scale-[0.98] transition-all w-full"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-accent)]/20 flex items-center justify-center border border-[var(--color-brand-accent)]/20">
                            <IconGrid className="w-4 h-4 text-[var(--color-brand-accent)]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)] block leading-none mb-1">Documentation</span>
                            <span className="font-bold text-white leading-none">{activeLabel}</span>
                        </div>
                    </div>
                    <div className={cn("transition-transform duration-300", isMobileMenuOpen ? "rotate-180" : "")}>
                        <svg className="w-5 h-5 text-[var(--color-brand-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {isMobileMenuOpen && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#0a0a0a] border border-white/10 animate-slide-up shadow-2xl max-h-[60vh] overflow-y-auto no-scrollbar">
                        <NavigationContent />
                    </div>
                )}
            </div>

            {/* --- Desktop Sidebar --- */}
            {/* Sticky at top-[72px] + 2rem margin = top-[104px] */}
            <aside className="hidden lg:block w-64 space-y-6 shrink-0 sticky top-[104px] h-fit pb-10">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-accent)]/20 flex items-center justify-center border border-[var(--color-brand-accent)]/20">
                        <IconGrid className="w-4 h-4 text-[var(--color-brand-accent)]" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Documentation</span>
                </div>
                <NavigationContent />
            </aside>

            {/* --- Content Area --- */}
            <main className="flex-1 min-w-0">
                <div className="glass-card p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 min-h-[500px] lg:min-h-[700px]">
                    
                    {activeSection === 'intro' && (
                        <div className="space-y-6 animate-slide-up">
                            <h1 className="text-2xl md:text-3xl font-black gradient-text">SecurePay API Hub</h1>
                            <p className="text-[var(--color-brand-secondary)] leading-relaxed text-sm md:text-base">
                                Welcome to our developer documentation. Use our API to integrate SecurePay's real-time currency processing and wallet management into your applications.
                            </p>
                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm">
                                <strong>Tip:</strong> All endpoints require a JWT Bearer token in the <code>Authorization</code> header.
                            </div>
                        </div>
                    )}

                    {activeSection === 'rates-euro' && (
                        <div className="space-y-8 animate-slide-up">
                            <header>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded border border-green-500/20 uppercase">GET</span>
                                    <h2 className="text-xl md:text-2xl font-bold">Euro Base Rates</h2>
                                </div>
                                <p className="text-[var(--color-brand-secondary)] text-sm md:text-base">Fetch real-time exchange rates specifically relative to the Euro.</p>
                            </header>

                            <section className="space-y-4">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Request Example</h3>
                                <CodeBlock 
                                    language="HTTP"
                                    code={`GET /api/market/rates/base/EUR\nAuthorization: Bearer <token>`}
                                />
                            </section>

                            <section className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Expected JSON Output</h3>
                                    <span className="text-[10px] text-green-500 font-bold self-start">Simplified Response</span>
                                </div>
                                <p className="text-[11px] md:text-xs text-[var(--color-brand-secondary)]">Unlike BNR's traditional XML format, our endpoint provides a clean JSON structure.</p>
                                <CodeBlock 
                                    language="json"
                                    code={`{\n  "base": "EUR",\n  "date": "2026-05-12",\n  "rates": {\n    "USD": 1.0824,\n    "GBP": 0.8592,\n    "RON": 4.9750,\n    "CHF": 0.9812,\n    "JPY": 168.45\n  }\n}`}
                                />
                            </section>
                        </div>
                    )}

                    {activeSection === 'rates-all' && (
                        <div className="space-y-8 animate-slide-up">
                            <header>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded border border-green-500/20 uppercase">GET</span>
                                    <h2 className="text-xl md:text-2xl font-bold">Global Market Rates</h2>
                                </div>
                                <p className="text-[var(--color-brand-secondary)] text-sm md:text-base">Direct access to core currency rates synced with BNR data.</p>
                            </header>

                            <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
                                <IconChartBar className="w-8 h-8 text-[var(--color-brand-accent)] mb-4" />
                                <h4 className="font-bold mb-2">BNR Integration Simplified</h4>
                                <p className="text-xs md:text-sm text-[var(--color-brand-secondary)] leading-relaxed">
                                    While the National Bank of Romania (BNR) provides data in XML, we convert this into a standard JSON stream.
                                </p>
                            </div>

                            <CodeBlock 
                                language="bash"
                                code={`# Get all 10 supported currencies\ncurl -X GET "https://api.securepay.com/api/market/rates/all"`}
                            />
                        </div>
                    )}

                    {activeSection === 'wallet-get' && (
                        <div className="space-y-6 animate-slide-up">
                            <h2 className="text-xl md:text-2xl font-bold">Retrieve Wallet</h2>
                            <CodeBlock 
                                language="HTTP"
                                code={`GET /api/wallets/user/{userId}`}
                            />
                            <p className="text-[var(--color-brand-secondary)] text-sm md:text-base">Returns the full wallet object including all sub-accounts and IBANs.</p>
                        </div>
                    )}

                    {activeSection === 'wallet-create' && (
                        <div className="space-y-6 animate-slide-up">
                            <h2 className="text-xl md:text-2xl font-bold">Add New Account</h2>
                            <CodeBlock 
                                language="bash"
                                code={`curl -X POST "/api/wallets/{walletId}/accounts" \\\n     -d '{"currency": "USD"}'`}
                            />
                            <p className="text-[var(--color-brand-secondary)] text-sm md:text-base">Instantly provisions a new IBAN for the requested currency.</p>
                        </div>
                    )}

                    {activeSection === 'rates-history' && (
                        <div className="space-y-8 animate-slide-up">
                            <header>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded border border-green-500/20 uppercase">GET</span>
                                    <h2 className="text-xl md:text-2xl font-bold">Exchange Rate History</h2>
                                </div>
                                <p className="text-[var(--color-brand-secondary)] text-sm md:text-base">Retrieve time-series data or specific historical rates.</p>
                            </header>

                            <section className="space-y-4">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Fetch by Pair (Trend Data)</h3>
                                <p className="text-xs text-[var(--color-brand-secondary)]">Useful for building trend charts. Returns all historical points for a pair.</p>
                                <CodeBlock 
                                    language="HTTP"
                                    code={`GET /api/v1/exchange-rates/history/{base}/{target}`}
                                />
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Fetch by Date</h3>
                                <CodeBlock 
                                    language="HTTP"
                                    code={`GET /api/v1/exchange-rates/history/2026-05-12`}
                                />
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Response Structure</h3>
                                <CodeBlock 
                                    language="json"
                                    code={`[\n  {\n    "baseCurrency": "RON",\n    "targetCurrency": "EUR",\n    "rate": 4.9875,\n    "rateDate": "2026-05-11"\n  },\n  {\n    "baseCurrency": "RON",\n    "targetCurrency": "EUR",\n    "rate": 4.9840,\n    "rateDate": "2026-05-10"\n  }\n]`}
                                />
                            </section>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};
