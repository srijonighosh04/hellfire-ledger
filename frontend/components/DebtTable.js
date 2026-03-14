import { useState } from 'react';

export default function DebtTable({ cleanRecords, flaggedRecords }) {
    const [tab, setTab] = useState('clean');
    const [search, setSearch] = useState('');

    const allClean = cleanRecords || [];
    const allFlagged = flaggedRecords || [];

    const filtered = (tab === 'clean' ? allClean : allFlagged).filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (r.debtor || '').toLowerCase().includes(q) || (r.creditor || '').toLowerCase().includes(q);
    });

    return (
        <div className="retro-panel" style={{ padding: 0 }}>
            <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />

            {/* Tab header */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(57,255,20,0.2)' }}>
                <button
                    onClick={() => setTab('clean')}
                    style={{
                        flex: 1, padding: '0.7rem', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-terminal)', fontSize: '1rem', letterSpacing: '0.08em',
                        background: tab === 'clean' ? 'rgba(57,255,20,0.1)' : 'transparent',
                        color: tab === 'clean' ? 'var(--color-neon-green)' : 'rgba(57,255,20,0.4)',
                        borderRight: '1px solid rgba(57,255,20,0.2)',
                    }}
                    id="tab-clean"
                >
                    &gt; CLEAN RECORDS ({allClean.length})
                </button>
                <button
                    onClick={() => setTab('flagged')}
                    style={{
                        flex: 1, padding: '0.7rem', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-terminal)', fontSize: '1rem', letterSpacing: '0.08em',
                        background: tab === 'flagged' ? 'rgba(255,0,60,0.08)' : 'transparent',
                        color: tab === 'flagged' ? 'var(--color-neon-red)' : 'rgba(255,0,60,0.4)',
                    }}
                    id="tab-flagged"
                >
                    ⚠ FLAGGED ({allFlagged.length})
                </button>
            </div>

            {/* Search */}
            <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid rgba(57,255,20,0.1)' }}>
                <input
                    className="retro-input"
                    placeholder="&gt; SEARCH BY NAME..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    id="debt-search-input"
                />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
                <table className="retro-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>DEBTOR</th>
                            <th>CREDITOR</th>
                            <th>AMOUNT</th>
                            <th>CURRENCY</th>
                            {tab === 'flagged' && <th>ISSUES</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={tab === 'flagged' ? 6 : 5} style={{ textAlign: 'center', color: 'rgba(57,255,20,0.4)', padding: '2rem' }}>
                                {tab === 'clean' ? 'NO CLEAN RECORDS' : 'NO FLAGGED RECORDS — DATA IS CLEAN'}
                            </td></tr>
                        ) : filtered.map((row, i) => (
                            <tr key={row.id || i} className={tab === 'flagged' ? 'flagged' : ''}>
                                <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.75rem' }}>{row.id || i + 1}</td>
                                <td style={{ fontWeight: 'bold' }}>{row.debtor || '—'}</td>
                                <td>{row.creditor || '—'}</td>
                                <td style={{ fontFamily: 'var(--font-terminal)', fontSize: '1rem' }}>{row.amount}</td>
                                <td><span className={`badge ${tab === 'flagged' ? 'badge-red' : 'badge-green'}`}>{row.currency || 'HFG'}</span></td>
                                {tab === 'flagged' && (
                                    <td>
                                        {(row.issues || []).map((iss, ii) => (
                                            <span key={ii} className="badge badge-red" style={{ marginRight: '0.3rem', display: 'inline-block', marginBottom: '0.2rem' }}>{iss}</span>
                                        ))}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
