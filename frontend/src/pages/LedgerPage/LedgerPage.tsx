import React, { useEffect, useMemo, useState } from 'react';
import { ledgerService } from '../../services/ledgerService';
import type {
    LedgerEntryDirection,
    LedgerEntryFilters,
    LedgerEntryPage,
    LedgerEntryType,
    LedgerJournalFilters,
    LedgerJournalPage,
    LedgerJournalResponse,
    LedgerJournalStatus,
    LedgerJournalType
} from '../../types/ledger.types';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const journalTypes: Array<LedgerJournalType | 'ALL'> = ['ALL', 'TRANSFER', 'FEE', 'FX', 'DEPOSIT', 'WITHDRAWAL', 'REVERSAL'];
const journalStatuses: Array<LedgerJournalStatus | 'ALL'> = ['ALL', 'POSTED', 'REVERSED'];
const entryDirections: Array<LedgerEntryDirection | 'ALL'> = ['ALL', 'DEBIT', 'CREDIT'];
const entryTypes: Array<LedgerEntryType | 'ALL'> = ['ALL', 'PRINCIPAL', 'FEE', 'FX_CLEARING', 'EXTERNAL_CLEARING'];

const emptyJournalFilters: LedgerJournalFilters = {
    type: 'ALL',
    status: 'ALL',
    direction: 'ALL',
    entryType: 'ALL'
};

const emptyEntryFilters: LedgerEntryFilters = {
    direction: 'ALL',
    entryType: 'ALL',
    journalType: 'ALL',
    journalStatus: 'ALL'
};

export const LedgerPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(role => role === 'ADMIN' || role === 'ROLE_ADMIN') || false;
    const [activeView, setActiveView] = useState<'journals' | 'entries'>('journals');
    const [journalFilters, setJournalFilters] = useState<LedgerJournalFilters>(emptyJournalFilters);
    const [entryFilters, setEntryFilters] = useState<LedgerEntryFilters>(emptyEntryFilters);
    const [journalPage, setJournalPage] = useState<LedgerJournalPage | null>(null);
    const [entryPage, setEntryPage] = useState<LedgerEntryPage | null>(null);
    const [journalPageNumber, setJournalPageNumber] = useState(0);
    const [entryPageNumber, setEntryPageNumber] = useState(0);
    const [selectedJournal, setSelectedJournal] = useState<LedgerJournalResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const journalSummary = useMemo(() => {
        const journals = journalPage?.content || [];
        return {
            posted: journals.filter(journal => journal.status === 'POSTED').length,
            reversed: journals.filter(journal => journal.status === 'REVERSED').length,
            entries: journals.reduce((total, journal) => total + journal.entries.length, 0)
        };
    }, [journalPage]);

    useEffect(() => {
        if (!isAdmin) return;
        void fetchJournals(0);
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin || activeView !== 'entries' || entryPage) return;
        void fetchEntries(0);
    }, [activeView, entryPage, isAdmin]);

    const fetchJournals = async (page = journalPageNumber) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await ledgerService.getJournals(journalFilters, page, 20);
            setJournalPage(data);
            setJournalPageNumber(data.number);
            setSelectedJournal(data.content[0] || null);
        } catch (err) {
            console.error('Failed to fetch ledger journals:', err);
            setError('Could not load ledger journals.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEntries = async (page = entryPageNumber) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await ledgerService.getEntries(entryFilters, page, 50);
            setEntryPage(data);
            setEntryPageNumber(data.number);
        } catch (err) {
            console.error('Failed to fetch ledger entries:', err);
            setError('Could not load ledger entries.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateJournalFilter = (key: keyof LedgerJournalFilters, value: string) => {
        setJournalFilters(prev => ({ ...prev, [key]: value }));
    };

    const updateEntryFilter = (key: keyof LedgerEntryFilters, value: string) => {
        setEntryFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyJournalFilters = () => {
        void fetchJournals(0);
    };

    const applyEntryFilters = () => {
        void fetchEntries(0);
    };

    if (!isAdmin) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-3xl font-black tracking-tight">Ledger</h2>
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6">
                    <p className="font-bold text-amber-300">Admin access required</p>
                    <p className="text-sm text-[var(--color-brand-secondary)] mt-1">
                        Ledger records contain internal accounting data and are not available for regular users.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-brand-accent)]">
                        Admin Console
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">Ledger Audit</h2>
                    <p className="text-sm text-[var(--color-brand-secondary)] mt-1">
                        Search journal records and accounting entries posted by wallet settlement events.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 min-w-full lg:min-w-[360px]">
                    <Metric label="Posted" value={journalSummary.posted} />
                    <Metric label="Reversed" value={journalSummary.reversed} />
                    <Metric label="Entries" value={journalSummary.entries} />
                </div>
            </header>

            <div className="flex gap-2 border-b border-white/10">
                <TabButton active={activeView === 'journals'} onClick={() => setActiveView('journals')} label="Journals" />
                <TabButton active={activeView === 'entries'} onClick={() => setActiveView('entries')} label="Entries" />
            </div>

            {error && (
                <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {activeView === 'journals' ? (
                <section className="space-y-4">
                    <JournalFilters
                        filters={journalFilters}
                        onChange={updateJournalFilter}
                        onApply={applyJournalFilters}
                        onReset={() => setJournalFilters(emptyJournalFilters)}
                    />

                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="overflow-x-auto">
                                <div className="min-w-[720px]">
                                    <TableHeader
                                        columns={['Posted', 'Type', 'Status', 'Transfer', 'Entries']}
                                        gridClassName="grid-cols-[140px_110px_110px_minmax(0,1fr)_80px]"
                                    />
                                    <div className="divide-y divide-white/5">
                                        {isLoading && <LoadingRow />}
                                        {!isLoading && journalPage?.content.map(journal => (
                                            <button
                                                key={journal.id}
                                                onClick={() => setSelectedJournal(journal)}
                                                className={cn(
                                                    "w-full grid grid-cols-[140px_110px_110px_minmax(0,1fr)_80px] gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors",
                                                    selectedJournal?.id === journal.id && "bg-[var(--color-brand-accent)]/10"
                                                )}
                                            >
                                                <Cell>{formatDate(journal.postedAt)}</Cell>
                                                <Badge label={journal.type} tone="blue" />
                                                <Badge label={journal.status} tone={journal.status === 'POSTED' ? 'green' : 'red'} />
                                                <Cell mono>{journal.transferId || journal.sourceEventId}</Cell>
                                                <Cell>{journal.entries.length}</Cell>
                                            </button>
                                        ))}
                                        {!isLoading && journalPage?.empty && <EmptyRow label="No journals match these filters." />}
                                    </div>
                                </div>
                            </div>
                            <Pager
                                page={journalPageNumber}
                                totalPages={journalPage?.totalPages || 0}
                                onPrev={() => void fetchJournals(Math.max(0, journalPageNumber - 1))}
                                onNext={() => void fetchJournals(journalPageNumber + 1)}
                            />
                        </div>

                        <JournalDetail journal={selectedJournal} />
                    </div>
                </section>
            ) : (
                <section className="space-y-4">
                    <EntryFilters
                        filters={entryFilters}
                        onChange={updateEntryFilter}
                        onApply={applyEntryFilters}
                        onReset={() => setEntryFilters(emptyEntryFilters)}
                    />

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                <TableHeader
                                    columns={['Created', 'Direction', 'Type', 'Currency', 'Amount', 'Account']}
                                    gridClassName="grid-cols-[140px_110px_150px_90px_110px_minmax(0,1fr)]"
                                />
                                <div className="divide-y divide-white/5">
                                    {isLoading && <LoadingRow />}
                                    {!isLoading && entryPage?.content.map(entry => (
                                        <div key={entry.id} className="grid grid-cols-[140px_110px_150px_90px_110px_minmax(0,1fr)] gap-3 px-4 py-3">
                                            <Cell>{formatDate(entry.createdAt)}</Cell>
                                            <Badge label={entry.direction} tone={entry.direction === 'DEBIT' ? 'red' : 'green'} />
                                            <Badge label={entry.entryType} tone="blue" />
                                            <Cell>{entry.currency}</Cell>
                                            <Cell mono>{entry.amount.toFixed(2)}</Cell>
                                            <Cell mono>{entry.accountRef}</Cell>
                                        </div>
                                    ))}
                                    {!isLoading && entryPage?.empty && <EmptyRow label="No entries match these filters." />}
                                </div>
                            </div>
                        </div>
                        <Pager
                            page={entryPageNumber}
                            totalPages={entryPage?.totalPages || 0}
                            onPrev={() => void fetchEntries(Math.max(0, entryPageNumber - 1))}
                            onNext={() => void fetchEntries(entryPageNumber + 1)}
                        />
                    </div>
                </section>
            )}
        </div>
    );
};

const JournalFilters: React.FC<{
    filters: LedgerJournalFilters;
    onChange: (key: keyof LedgerJournalFilters, value: string) => void;
    onApply: () => void;
    onReset: () => void;
}> = ({ filters, onChange, onApply, onReset }) => (
    <FilterPanel onApply={onApply} onReset={onReset}>
        <TextFilter label="User ID" value={filters.userId} onChange={value => onChange('userId', value)} />
        <TextFilter label="Wallet Account ID" value={filters.walletAccountId} onChange={value => onChange('walletAccountId', value)} />
        <TextFilter label="Transfer ID" value={filters.transferId} onChange={value => onChange('transferId', value)} />
        <TextFilter label="Currency" value={filters.currency} onChange={value => onChange('currency', value.toUpperCase())} />
        <SelectFilter label="Type" value={filters.type || 'ALL'} options={journalTypes} onChange={value => onChange('type', value)} />
        <SelectFilter label="Status" value={filters.status || 'ALL'} options={journalStatuses} onChange={value => onChange('status', value)} />
        <SelectFilter label="Direction" value={filters.direction || 'ALL'} options={entryDirections} onChange={value => onChange('direction', value)} />
        <SelectFilter label="Entry Type" value={filters.entryType || 'ALL'} options={entryTypes} onChange={value => onChange('entryType', value)} />
        <DateFilter label="Posted From" value={filters.postedFrom} onChange={value => onChange('postedFrom', value)} />
        <DateFilter label="Posted To" value={filters.postedTo} onChange={value => onChange('postedTo', value)} />
    </FilterPanel>
);

const EntryFilters: React.FC<{
    filters: LedgerEntryFilters;
    onChange: (key: keyof LedgerEntryFilters, value: string) => void;
    onApply: () => void;
    onReset: () => void;
}> = ({ filters, onChange, onApply, onReset }) => (
    <FilterPanel onApply={onApply} onReset={onReset}>
        <TextFilter label="User ID" value={filters.userId} onChange={value => onChange('userId', value)} />
        <TextFilter label="Wallet Account ID" value={filters.walletAccountId} onChange={value => onChange('walletAccountId', value)} />
        <TextFilter label="Transfer ID" value={filters.transferId} onChange={value => onChange('transferId', value)} />
        <TextFilter label="Account Ref" value={filters.accountRef} onChange={value => onChange('accountRef', value)} />
        <TextFilter label="Currency" value={filters.currency} onChange={value => onChange('currency', value.toUpperCase())} />
        <SelectFilter label="Direction" value={filters.direction || 'ALL'} options={entryDirections} onChange={value => onChange('direction', value)} />
        <SelectFilter label="Entry Type" value={filters.entryType || 'ALL'} options={entryTypes} onChange={value => onChange('entryType', value)} />
        <SelectFilter label="Journal Type" value={filters.journalType || 'ALL'} options={journalTypes} onChange={value => onChange('journalType', value)} />
        <SelectFilter label="Journal Status" value={filters.journalStatus || 'ALL'} options={journalStatuses} onChange={value => onChange('journalStatus', value)} />
        <DateFilter label="Posted From" value={filters.postedFrom} onChange={value => onChange('postedFrom', value)} />
        <DateFilter label="Posted To" value={filters.postedTo} onChange={value => onChange('postedTo', value)} />
    </FilterPanel>
);

const FilterPanel: React.FC<{ children: React.ReactNode; onApply: () => void; onReset: () => void }> = ({ children, onApply, onReset }) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {children}
        </div>
        <div className="mt-4 flex justify-end gap-2">
            <button onClick={onReset} className="h-10 px-4 rounded-xl border border-white/10 text-xs font-black uppercase text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5">
                Reset
            </button>
            <button onClick={onApply} className="h-10 px-5 rounded-xl bg-[var(--color-brand-accent)] text-xs font-black uppercase text-white hover:opacity-90">
                Apply
            </button>
        </div>
    </div>
);

const TextFilter: React.FC<{ label: string; value?: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
    <label className="space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">{label}</span>
        <input
            value={value || ''}
            onChange={event => onChange(event.target.value)}
            className="w-full h-10 rounded-xl bg-black/20 border border-white/10 px-3 text-xs font-semibold outline-none focus:border-[var(--color-brand-accent)]"
        />
    </label>
);

const DateFilter: React.FC<{ label: string; value?: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
    <label className="space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">{label}</span>
        <input
            type="datetime-local"
            value={toDateInputValue(value)}
            onChange={event => onChange(event.target.value ? `${event.target.value}:00` : '')}
            className="w-full h-10 rounded-xl bg-black/20 border border-white/10 px-3 text-xs font-semibold outline-none focus:border-[var(--color-brand-accent)]"
        />
    </label>
);

const SelectFilter: React.FC<{ label: string; value: string; options: string[]; onChange: (value: string) => void }> = ({ label, value, options, onChange }) => (
    <label className="space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">{label}</span>
        <select
            value={value}
            onChange={event => onChange(event.target.value)}
            className="w-full h-10 rounded-xl bg-black/20 border border-white/10 px-3 text-xs font-semibold outline-none focus:border-[var(--color-brand-accent)]"
        >
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    </label>
);

const JournalDetail: React.FC<{ journal: LedgerJournalResponse | null }> = ({ journal }) => {
    if (!journal) {
        return (
            <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-[var(--color-brand-secondary)]">
                Select a journal to inspect entries.
            </aside>
        );
    }

    return (
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">Selected Journal</p>
                <p className="mt-1 text-sm font-black break-all">{journal.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <Info label="Type" value={journal.type} />
                <Info label="Status" value={journal.status} />
                <Info label="Source" value={journal.sourceService} />
                <Info label="Posted" value={formatDate(journal.postedAt)} />
            </div>
            <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">Entries</p>
                {journal.entries.map(entry => (
                    <div key={entry.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                            <Badge label={entry.direction} tone={entry.direction === 'DEBIT' ? 'red' : 'green'} />
                            <span className="text-sm font-black tabular-nums">{entry.amount.toFixed(2)} {entry.currency}</span>
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-[var(--color-brand-secondary)] break-all">{entry.accountRef}</p>
                        <p className="mt-1 text-[10px] font-bold text-[var(--color-brand-accent)]">{entry.entryType}</p>
                    </div>
                ))}
            </div>
        </aside>
    );
};

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">{label}</p>
        <p className="text-xl font-black tabular-nums">{value}</p>
    </div>
);

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors",
            active ? "border-[var(--color-brand-accent)] text-white" : "border-transparent text-[var(--color-brand-secondary)] hover:text-white"
        )}
    >
        {label}
    </button>
);

const TableHeader: React.FC<{ columns: string[]; gridClassName: string }> = ({ columns, gridClassName }) => (
    <div className={cn("grid gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/10", gridClassName)}>
        {columns.map(column => (
            <span key={column} className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">
                {column}
            </span>
        ))}
    </div>
);

const Cell: React.FC<{ children: React.ReactNode; mono?: boolean }> = ({ children, mono }) => (
    <span className={cn("text-xs font-bold text-white/90 truncate", mono && "font-mono text-[11px] text-[var(--color-brand-secondary)]")}>
        {children}
    </span>
);

const Badge: React.FC<{ label: string; tone: 'green' | 'red' | 'blue' }> = ({ label, tone }) => (
    <span className={cn(
        "inline-flex h-6 items-center justify-center rounded-lg px-2 text-[10px] font-black uppercase",
        tone === 'green' && "bg-emerald-500/10 text-emerald-300",
        tone === 'red' && "bg-red-500/10 text-red-300",
        tone === 'blue' && "bg-blue-500/10 text-blue-300"
    )}>
        {label}
    </span>
);

const Info: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div className="rounded-xl bg-black/20 border border-white/5 p-3">
        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">{label}</p>
        <p className="mt-1 font-bold break-all">{value || '-'}</p>
    </div>
);

const Pager: React.FC<{ page: number; totalPages: number; onPrev: () => void; onNext: () => void }> = ({ page, totalPages, onPrev, onNext }) => (
    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="text-xs font-bold text-[var(--color-brand-secondary)]">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
            <button disabled={page <= 0} onClick={onPrev} className="h-9 px-3 rounded-lg border border-white/10 text-xs font-bold disabled:opacity-30 hover:bg-white/5">
                Previous
            </button>
            <button disabled={totalPages === 0 || page >= totalPages - 1} onClick={onNext} className="h-9 px-3 rounded-lg border border-white/10 text-xs font-bold disabled:opacity-30 hover:bg-white/5">
                Next
            </button>
        </div>
    </div>
);

const LoadingRow = () => (
    <div className="px-4 py-8 text-center text-sm text-[var(--color-brand-secondary)]">Loading ledger data...</div>
);

const EmptyRow: React.FC<{ label: string }> = ({ label }) => (
    <div className="px-4 py-8 text-center text-sm text-[var(--color-brand-secondary)]">{label}</div>
);

const formatDate = (value: string) => new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
});

const toDateInputValue = (value?: string) => value ? value.slice(0, 16) : '';
