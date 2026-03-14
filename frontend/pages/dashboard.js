import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import DebtTable from '../components/DebtTable';
import OptimizedGraph from '../components/OptimizedGraph';
import TransactionPanel from '../components/TransactionPanel';

export default function Dashboard() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [view, setView] = useState('data'); // 'data' | 'settle'

    useEffect(() => {
        const stored = localStorage.getItem('hellfire_ledger_data');
        if (stored) {
            try { setData(JSON.parse(stored)); }
            catch (e) { router.push('/upload'); }
        } else {
            router.push('/upload');
        }
    }, [router]);

    if (!data) {
        return (
            <div className="page-wrapper">
                <NavBar />
                <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                    <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.5rem', color: 'var(--color-neon-green)' }} className="pulse-glow">
                        LOADING MAINFRAME DATA<span className="blink">...</span>
                    </div>
                </main>
            </div>
        );
    }

    const { summary, clean, flagged, transactions, netBalances } = data;

    return (
        <div className="page-wrapper">
            <Head>
                <title>Hellfire Ledger — Mainframe Console</title>
            </Head>
            <NavBar />

            <main className="main-content fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-terminal)', fontSize: '2.5rem', color: 'var(--color-neon-green)', marginBottom: '0.3rem' }} className="text-glow-green">
                            MAINFRAME CONSOLE
                        </h1>
                        <p style={{ color: 'rgba(57,255,20,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                            &gt; DEBT OPTIMIZATION COMPLETE — REVIEW AND EXECUTE
                        </p>
                    </div>
                    <button className="btn-red" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}
                        onClick={() => { localStorage.removeItem('hellfire_ledger_data'); router.push('/upload'); }}>
                        [ EJECT DISK ]
                    </button>
                </div>

                {/* Summary stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'TOTAL RECORDS', value: summary?.totalRows || 0, color: 'var(--color-neon-green)' },
                        { label: 'CLEAN RECORDS', value: summary?.cleanRows || 0, color: 'var(--color-neon-green)' },
                        { label: 'FLAGGED', value: summary?.flaggedRows || 0, color: summary?.flaggedRows > 0 ? 'var(--color-neon-red)' : 'var(--color-neon-green)' },
                        { label: 'MIN TRANSACTIONS', value: summary?.transactionsNeeded || 0, color: 'var(--color-amber)' },
                    ].map((s, i) => (
                        <div key={i} className="retro-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                            <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '2.5rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(57,255,20,0.5)', marginTop: '0.4rem', letterSpacing: '0.08em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '1px solid rgba(57,255,20,0.3)', width: 'fit-content' }}>
                    {[['data', '📊 DATA REVIEW'], ['settle', '⚡ SETTLE DEBTS']].map(([v, label]) => (
                        <button key={v} onClick={() => setView(v)} id={`view-${v}-btn`}
                            style={{
                                padding: '0.6rem 1.4rem', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-terminal)', fontSize: '1rem', letterSpacing: '0.08em',
                                background: view === v ? (v === 'settle' ? 'rgba(255,0,60,0.15)' : 'rgba(57,255,20,0.1)') : 'transparent',
                                color: view === v ? (v === 'settle' ? 'var(--color-neon-red)' : 'var(--color-neon-green)') : 'rgba(57,255,20,0.4)',
                            }}>
                            {label}
                        </button>
                    ))}
                </div>

                {view === 'data' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <DebtTable cleanRecords={clean} flaggedRecords={flagged} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        <OptimizedGraph transactions={transactions} netBalances={netBalances} />
                        <TransactionPanel transactions={transactions} />
                    </div>
                )}
            </main>
        </div>
    );
}
