import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import BootSequence from '../components/BootSequence';
import WalletConnect from '../components/WalletConnect';

export default function Home() {
  const router = useRouter();
  const [bootDone, setBootDone] = useState(false);

  const handleEnter = () => router.push('/upload');

  return (
    <div className="page-wrapper">
      <Head>
        <title>Hellfire Ledger — Hawkins Lab Mainframe</title>
      </Head>

      {/* Full screen boot sequence first */}
      {!bootDone ? (
        <BootSequence onComplete={() => setBootDone(true)} />
      ) : (
        <>
          <NavBar />
          <main className="main-content fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>

            {/* Hero Title */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-terminal)', fontSize: 'clamp(2.5rem, 8vw, 7rem)', color: 'var(--color-neon-red)', lineHeight: 1.1 }} className="text-glow-red crt-flicker">
                🔥 HELLFIRE
              </div>
              <div style={{ fontFamily: 'var(--font-terminal)', fontSize: 'clamp(2.5rem, 8vw, 7rem)', color: 'var(--color-neon-green)', lineHeight: 1.1 }} className="text-glow-green">
                LEDGER
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'rgba(57,255,20,0.6)', marginTop: '1rem', fontSize: '1rem', letterSpacing: '0.15em' }}>
                &gt; SECURE DEBT RESOLUTION PROTOCOL v1.0 ■
              </p>
            </div>

            {/* Info Panel */}
            <div className="retro-panel" style={{ maxWidth: '700px', width: '100%', marginBottom: '2rem' }}>
              <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: 2.0, color: 'rgba(57,255,20,0.75)' }}>
                <span style={{ color: 'var(--color-neon-green)' }}>SYS &gt;</span> HAWKINS LAB MAINFRAME INITIALIZED<br />
                <span style={{ color: 'var(--color-amber)' }}>SYS &gt;</span> ANTI-TAMPER BLOCKCHAIN LEDGER: <span className="text-glow-green">ACTIVE</span><br />
                <span style={{ color: 'var(--color-neon-green)' }}>SYS &gt;</span> SEPOLIA TESTNET: <span className="text-glow-green">CONNECTED</span><br />
                <span style={{ color: 'var(--color-neon-red)' }}>SYS &gt;</span> <span className="blink">AWAITING OPERATOR AUTHENTICATION...</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <WalletConnect />
                <button className="btn-red" onClick={handleEnter} id="enter-protocol-btn">
                  [ ENTER PROTOCOL ]
                </button>
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '700px', width: '100%' }}>
              {[
                { icon: '📂', label: 'CSV DATA INGESTION', desc: 'Upload messy debt records — we clean them automatically' },
                { icon: '🧮', label: 'GRAPH OPTIMIZER', desc: 'Minimize transactions using cash-flow algorithm' },
                { icon: '⛓️', label: 'BLOCKCHAIN EXEC', desc: 'Sign & settle debts with HFG tokens on Sepolia' },
              ].map((f, i) => (
                <div key={i} className="retro-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
                  <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                  <div style={{ fontFamily: 'var(--font-terminal)', color: 'var(--color-neon-green)', fontSize: '1rem', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>{f.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(57,255,20,0.5)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
