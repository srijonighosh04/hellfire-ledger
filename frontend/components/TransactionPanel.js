import { useState } from 'react';
import { Contract, parseUnits, BrowserProvider } from 'ethers';

const HFG_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint256)',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function TransactionPanel({ transactions }) {
    const [statuses, setStatuses] = useState({});
    const [hashes, setHashes] = useState({});
    const [recipientMap, setRecipientMap] = useState({});

    const setStatus = (idx, status) => setStatuses(p => ({ ...p, [idx]: status }));
    const setHash = (idx, hash) => setHashes(p => ({ ...p, [idx]: hash }));

    const executeTransaction = async (idx, tx) => {
        if (!window.ethereum) { alert('MetaMask not detected.'); return; }

        const addr = recipientMap[idx];
        if (!addr || !addr.startsWith('0x') || addr.length !== 42) {
            alert(`Please enter a valid Ethereum address for "${tx.to}"`);
            return;
        }

        setStatus(idx, 'pending');
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const token = new Contract(CONTRACT_ADDRESS, HFG_ABI, signer);

            const decimals = await token.decimals().catch(() => 18n);
            const amountWei = parseUnits(tx.amount.toString(), decimals);
            const ethTx = await token.transfer(addr, amountWei);

            setStatus(idx, 'mining');
            setHash(idx, ethTx.hash);
            await ethTx.wait();
            setStatus(idx, 'done');
        } catch (err) {
            console.error(err);
            setStatus(idx, 'failed');
        }
    };

    if (!transactions || transactions.length === 0) return null;

    const statusConfig = {
        pending: { color: 'var(--color-amber)', label: 'SIGNING...' },
        mining: { color: 'var(--color-neon-blue)', label: 'MINING...' },
        done: { color: 'var(--color-neon-green)', label: 'SETTLED ✓' },
        failed: { color: 'var(--color-neon-red)', label: 'FAILED ✗' },
    };

    return (
        <div className="retro-panel" style={{ padding: 0 }}>
            <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
            <div className="panel-bar">
                <span style={{ color: 'var(--color-neon-green)' }}>⚡ EXECUTION TERMINAL</span>
                <span style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.85rem' }}>AWAITING SIGNATURES</span>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
                {transactions.map((tx, idx) => {
                    const st = statuses[idx];
                    const hash = hashes[idx];
                    const cfg = statusConfig[st];

                    return (
                        <div key={idx} style={{
                            border: `1px solid ${st === 'done' ? 'rgba(57,255,20,0.4)' : st === 'failed' ? 'rgba(255,0,60,0.4)' : 'rgba(57,255,20,0.15)'}`,
                            padding: '1rem', background: 'rgba(0,0,0,0.5)',
                            transition: 'border-color 0.3s',
                        }}>
                            {/* Tx summary */}
                            <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.1rem', marginBottom: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                                <span style={{ color: 'white' }}>SEND </span>
                                <span style={{ color: 'var(--color-neon-green)' }} className="text-glow-green">{tx.amount} HFG</span>
                                <span style={{ color: 'white' }}> TO </span>
                                <span style={{ color: 'var(--color-neon-red)' }}>{tx.to}</span>
                                <span style={{ color: 'white' }}> FROM </span>
                                <span style={{ color: 'rgba(57,255,20,0.7)' }}>{tx.from}</span>
                            </div>

                            {/* Wallet address input */}
                            {!st || st === 'failed' ? (
                                <input
                                    className="retro-input"
                                    style={{ marginBottom: '0.7rem', fontSize: '0.8rem' }}
                                    placeholder={`0x... (wallet address of ${tx.to})`}
                                    value={recipientMap[idx] || ''}
                                    onChange={e => setRecipientMap(p => ({ ...p, [idx]: e.target.value }))}
                                    id={`recipient-input-${idx}`}
                                />
                            ) : null}

                            {/* Status + hash */}
                            {st && (
                                <div style={{ fontSize: '0.8rem', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)', color: cfg.color }}>
                                    <span className="status-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                                    {cfg.label}
                                    {hash && (
                                        <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer"
                                            style={{ marginLeft: '0.5rem', color: 'var(--color-neon-blue)', textDecoration: 'none', fontSize: '0.75rem' }}>
                                            TX: {hash.slice(0, 12)}... [↗ ETHERSCAN]
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Execute button */}
                            <button
                                className={st === 'done' ? 'btn-green' : 'btn-red'}
                                onClick={() => executeTransaction(idx, tx)}
                                disabled={st === 'pending' || st === 'mining' || st === 'done'}
                                id={`execute-btn-${idx}`}
                                style={{ width: '100%' }}
                            >
                                {st === 'done' ? '✓ SETTLED' : st === 'pending' || st === 'mining' ? `${cfg.label}` : '[ EXECUTE TX ]'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
