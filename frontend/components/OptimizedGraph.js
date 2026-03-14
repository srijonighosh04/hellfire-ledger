export default function OptimizedGraph({ transactions, netBalances }) {
    if (!transactions || transactions.length === 0) return null;

    const people = Object.entries(netBalances || {});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Settlement map */}
            <div className="retro-panel" style={{ padding: 0 }}>
                <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                <div className="panel-bar">
                    <span style={{ color: 'var(--color-neon-red)' }}>⛓ SETTLEMENT MAP</span>
                    <span style={{ color: 'rgba(57,255,20,0.5)', fontSize: '0.9rem' }}>{transactions.length} TX REQUIRED</span>
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {transactions.map((tx, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.6rem 0.8rem', borderLeft: '2px solid var(--color-neon-green)',
                            background: 'linear-gradient(90deg, rgba(57,255,20,0.05) 0%, transparent 100%)',
                            flexWrap: 'wrap', gap: '0.5rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.1rem', color: 'var(--color-neon-red)' }}>{tx.from}</span>
                                <span style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.8rem' }}>──PAYS──▶</span>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.1rem', color: 'var(--color-neon-green)' }}>{tx.to}</span>
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-terminal)', fontSize: '1.2rem',
                                background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.7rem',
                                border: '1px solid rgba(57,255,20,0.3)', color: 'var(--color-neon-green)',
                            }}>
                                {tx.amount} HFG
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Net balances */}
            {people.length > 0 && (
                <div className="retro-panel" style={{ padding: 0 }}>
                    <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                    <div className="panel-bar">
                        <span>NET BALANCES</span>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {people.sort((a, b) => b[1] - a[1]).map(([name, bal]) => {
                            const isPos = bal > 0;
                            const pct = Math.min(Math.abs(bal) / (Math.max(...people.map(p => Math.abs(p[1]))) || 1) * 100, 100);
                            return (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                    <div style={{ width: '100px', fontFamily: 'var(--font-terminal)', fontSize: '0.95rem', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                                    <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                        <div style={{
                                            height: '100%', width: `${pct}%`,
                                            background: isPos ? 'var(--color-neon-green)' : 'var(--color-neon-red)',
                                            boxShadow: isPos ? '0 0 6px var(--color-neon-green)' : '0 0 6px var(--color-neon-red)',
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', fontFamily: 'var(--font-terminal)', fontSize: '0.95rem', color: isPos ? 'var(--color-neon-green)' : 'var(--color-neon-red)', flexShrink: 0 }}>
                                        {isPos ? '+' : ''}{parseFloat(bal).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
