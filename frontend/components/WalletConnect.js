import { useState, useEffect, useCallback } from 'react';
import { connectWallet, getConnectedAddress } from '../wallet';

export default function WalletConnect({ compact = false }) {
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tryConnect = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            await connectWallet();
            const addr = await getConnectedAddress();
            setAddress(addr);
        } catch (err) {
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-detect if already connected on mount
    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum) return;
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts && accounts.length > 0) setAddress(accounts[0]);
        });
        const handler = (accounts) => setAddress(accounts[0] || null);
        window.ethereum.on('accountsChanged', handler);
        return () => window.ethereum.removeListener('accountsChanged', handler);
    }, []);

    const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

    if (compact) {
        return address ? (
            <span style={{
                fontFamily: 'var(--font-terminal)', fontSize: '0.95rem',
                color: 'var(--color-neon-green)', letterSpacing: '0.05em',
                border: '1px solid rgba(57,255,20,0.4)', padding: '0.2rem 0.6rem',
            }}>
                <span className="status-dot green" />
                {short}
            </span>
        ) : (
            <button className="btn-green" style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }} onClick={tryConnect} id="wallet-connect-btn" disabled={loading}>
                {loading ? 'LINKING...' : '[ CONNECT ]'}
            </button>
        );
    }

    return (
        <div>
            {address ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="status-dot green" />
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.1rem', color: 'var(--color-neon-green)' }}>
                        {short}
                    </span>
                    <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: '0.7rem', color: 'rgba(57,255,20,0.5)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                        [↗ ETHERSCAN]
                    </a>
                </div>
            ) : (
                <div>
                    <button className="btn-green" onClick={tryConnect} id="wallet-connect-btn-main" disabled={loading}>
                        {loading ? '⠿ LINKING TO MAINFRAME...' : '[ CONNECT METAMASK ]'}
                    </button>
                    {error && <div style={{ color: 'var(--color-neon-red)', fontSize: '0.75rem', marginTop: '0.4rem' }}>⚠ {error}</div>}
                </div>
            )}
        </div>
    );
}
