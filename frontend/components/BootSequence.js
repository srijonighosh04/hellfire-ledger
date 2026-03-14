import { useState, useEffect } from 'react';

const BOOT_LINES = [
    { text: 'HAWKINS NATIONAL LABORATORY — SECURE MAINFRAME', type: 'info', delay: 0 },
    { text: 'INITIALIZING SYSTEM BIOS v1984.10.31...', type: '', delay: 300 },
    { text: 'MEMORY CHECK: 640KB [ OK ]', type: '', delay: 600 },
    { text: 'LOADING HELLFIRE PROTOCOL KERNEL...', type: 'warn', delay: 900 },
    { text: 'BLOCKCHAIN INTERFACE: [ ONLINE ]', type: '', delay: 1200 },
    { text: 'ERC-20 HELLFIRE GOLD CONTRACT: [ LOADED ]', type: '', delay: 1500 },
    { text: 'DEBT OPTIMIZATION ENGINE: [ ARMED ]', type: '', delay: 1800 },
    { text: 'ANTI-TAMPER MODULE: [ ENGAGED ]', type: '', delay: 2100 },
    { text: '⚠  WARNING: UNAUTHORIZED ACCESS IS A CLASS-4 VIOLATION', type: 'error', delay: 2400 },
    { text: 'CONNECTING TO SEPOLIA TESTNET...', type: '', delay: 2700 },
    { text: '> LINK ESTABLISHED. CHAIN_ID: 11155111', type: 'info', delay: 3000 },
    { text: '██████████████████████████ 100%', type: '', delay: 3300 },
    { text: 'SYSTEM READY. WELCOME, OPERATOR.', type: 'info', delay: 3700 },
];

export default function BootSequence({ onComplete }) {
    const [visibleLines, setVisibleLines] = useState([]);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const timers = BOOT_LINES.map((line, i) =>
            setTimeout(() => {
                setVisibleLines(prev => [...prev, line]);
                if (i === BOOT_LINES.length - 1) {
                    setTimeout(() => {
                        setDone(true);
                        setTimeout(onComplete, 500);
                    }, 800);
                }
            }, line.delay)
        );
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-bg)', padding: '2rem',
            opacity: done ? 0 : 1, transition: 'opacity 0.5s ease',
        }}>
            {/* Retro logo */}
            <div style={{ fontFamily: 'var(--font-terminal)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--color-neon-red)', marginBottom: '2rem', letterSpacing: '0.15em' }} className="text-glow-red crt-flicker">
                🔥 HELLFIRE LEDGER
            </div>

            <div className="terminal-output" style={{ width: '100%', maxWidth: '700px', minHeight: '320px' }}>
                {visibleLines.map((line, i) => (
                    <span key={i} className={`terminal-line ${line.type} fade-in`} style={{ animationDelay: `${i * 0.05}s` }}>
                        {i === 0 ? '╔══ ' : '  '}
                        {line.text}
                    </span>
                ))}
                {visibleLines.length < BOOT_LINES.length && (
                    <span className="terminal-line">
                        <span className="blink">█</span>
                    </span>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', color: 'rgba(57,255,20,0.3)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                &gt; HAWKINS LAB MAINFRAME — CLEARANCE LEVEL: DELTA
            </div>
        </div>
    );
}
