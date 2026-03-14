import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import UploadCSV from '../components/UploadCSV';

export default function Upload() {
    const router = useRouter();

    const handleDataReady = (data) => {
        try {
            localStorage.setItem('hellfire_ledger_data', JSON.stringify(data));
            router.push('/dashboard');
        } catch (e) {
            console.error('Failed to store data:', e);
        }
    };

    return (
        <div className="page-wrapper">
            <Head>
                <title>Hellfire Ledger — Insert Data Disk</title>
            </Head>
            <NavBar />
            <main className="main-content fade-in">
                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                    <h1 style={{ fontFamily: 'var(--font-terminal)', fontSize: '2.5rem', color: 'var(--color-neon-green)', marginBottom: '0.4rem' }} className="text-glow-green">
                        DATA INGESTION
                    </h1>
                    <p style={{ color: 'rgba(57,255,20,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.08em' }}>
                        &gt; UPLOAD YOUR DEBT RECORDS — SYSTEM WILL CLEAN AND OPTIMIZE AUTOMATICALLY
                    </p>

                    <UploadCSV onDataReady={handleDataReady} />

                    {/* Format guide */}
                    <div className="retro-panel" style={{ marginTop: '2rem' }}>
                        <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                        <div style={{ fontFamily: 'var(--font-terminal)', color: 'var(--color-amber)', fontSize: '1.1rem', marginBottom: '0.7rem' }}>
                            📋 ACCEPTED CSV FORMAT
                        </div>
                        <div className="terminal-output" style={{ maxHeight: '120px' }}>
                            <span className="terminal-line">debtor,creditor,amount,currency</span>
                            <span className="terminal-line">EDDIE,DUSTIN,25.50,HFG</span>
                            <span className="terminal-line">MIKE,WILL,10,HFG</span>
                            <span className="terminal-line warn">&gt; Also accepts: from/to, Debtor/Creditor, payer/payee</span>
                            <span className="terminal-line info">&gt; Duplicates, blanks, and bad values are flagged automatically</span>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <a
                                href="/test_debts.csv"
                                download
                                style={{ color: 'var(--color-neon-green)', textDecoration: 'none', fontFamily: 'var(--font-terminal)', fontSize: '1rem', border: '1px solid rgba(57,255,20,0.4)', padding: '0.3rem 0.8rem' }}
                            >
                                💾 DOWNLOAD SAMPLE CSV
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
