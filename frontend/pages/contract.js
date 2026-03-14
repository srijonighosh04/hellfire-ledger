import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { Contract, BrowserProvider, formatUnits } from 'ethers';
import NavBar from '../components/NavBar';
import WalletConnect from '../components/WalletConnect';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const HFG_ABI = [
    'function publicMint(uint256 amount) external',
    'function balanceOf(address) view returns (uint256)',
    'function balanceHFG(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function getParticipants() view returns (address[])',
];

export default function ContractPage() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState(null);
    const [totalSupply, setTotalSupply] = useState(null);
    const [mintAmount, setMintAmount] = useState('100');
    const [mintStatus, setMintStatus] = useState('');
    const [mintHash, setMintHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState([]);

    const addLog = (text, type = '') => setLog(p => [...p, { text, type }]);

    const isPlaceholder = CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';

    // Load wallet & balance
    const loadWalletInfo = useCallback(async () => {
        if (!window.ethereum) return;
        try {
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (!accounts || accounts.length === 0) return;
            const addr = accounts[0];
            setAddress(addr);

            if (isPlaceholder) {
                addLog('⚠ CONTRACT NOT DEPLOYED YET — SHOWING DEMO MODE', 'warn');
                setBalance('N/A (deploy contract first)');
                return;
            }

            const contract = new Contract(CONTRACT_ADDRESS, HFG_ABI, provider);
            const [bal, supply] = await Promise.all([
                contract.balanceHFG(addr).catch(() => null),
                contract.totalSupply().catch(() => null),
            ]);
            if (bal !== null) setBalance(bal.toString());
            if (supply !== null) setTotalSupply(formatUnits(supply, 18));
            addLog(`> WALLET: ${addr.slice(0, 8)}...${addr.slice(-4)}`, 'info');
            addLog(`> HFG BALANCE: ${bal?.toString() || '?'}`, 'info');
        } catch (e) {
            addLog(`> ERROR: ${e.message}`, 'error');
        }
    }, [isPlaceholder]);

    useEffect(() => { loadWalletInfo(); }, [loadWalletInfo]);

    const handlePublicMint = async () => {
        const amount = parseInt(mintAmount);
        if (isNaN(amount) || amount <= 0 || amount > 1000) {
            addLog('⚠ Mint amount must be 1–1000 HFG', 'error'); return;
        }
        if (isPlaceholder) {
            addLog('⚠ Deploy the contract first to enable minting!', 'error'); return;
        }
        if (!window.ethereum) { addLog('⚠ MetaMask not found', 'error'); return; }

        setLoading(true);
        setMintStatus('pending');
        addLog(`> REQUESTING ${amount} HFG MINT...`, 'info');
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, HFG_ABI, signer);
            const tx = await contract.publicMint(amount);
            setMintHash(tx.hash);
            setMintStatus('mining');
            addLog(`> TX SUBMITTED: ${tx.hash}`, 'info');
            await tx.wait();
            setMintStatus('done');
            addLog(`> ✅ MINTED ${amount} HFG SUCCESSFULLY!`, '');
            await loadWalletInfo();
        } catch (err) {
            setMintStatus('failed');
            addLog(`> TX FAILED: ${err.message?.slice(0, 80)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Head><title>Hellfire Ledger — HFG Contract</title></Head>
            <NavBar />

            <main className="main-content fade-in">
                <h1 style={{ fontFamily: 'var(--font-terminal)', fontSize: '2.5rem', color: 'var(--color-neon-green)', marginBottom: '0.4rem' }} className="text-glow-green">
                    CONTRACT PANEL
                </h1>
                <p style={{ color: 'rgba(57,255,20,0.5)', fontSize: '0.85rem', letterSpacing: '0.08em', marginBottom: '2rem' }}>
                    &gt; HELLFIRE GOLD (HFG) — ERC-20 TOKEN ON SEPOLIA TESTNET
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                    {/* Contract Info */}
                    <div className="retro-panel">
                        <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                        <div style={{ fontFamily: 'var(--font-terminal)', color: 'var(--color-amber)', fontSize: '1.3rem', marginBottom: '1rem' }}>
                            ⛓ CONTRACT INFO
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                            {[
                                { label: 'NAME', value: 'Hellfire Gold' },
                                { label: 'SYMBOL', value: 'HFG' },
                                { label: 'NETWORK', value: 'Sepolia Testnet' },
                                { label: 'ADDRESS', value: isPlaceholder ? 'NOT DEPLOYED' : `${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-8)}` },
                                { label: 'TOTAL SUPPLY', value: totalSupply ? `${parseFloat(totalSupply).toLocaleString()} HFG` : 'Unknown' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(57,255,20,0.08)', paddingBottom: '0.4rem' }}>
                                    <span style={{ color: 'rgba(57,255,20,0.5)', letterSpacing: '0.05em' }}>{item.label}</span>
                                    <span style={{ color: 'var(--color-neon-green)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        {!isPlaceholder && (
                            <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer"
                                style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: 'var(--color-neon-blue)', textDecoration: 'none', fontFamily: 'var(--font-terminal)', fontSize: '1rem', border: '1px solid rgba(0,212,255,0.3)', padding: '0.4rem' }}>
                                [↗ VIEW ON ETHERSCAN]
                            </a>
                        )}
                    </div>

                    {/* Your Balance + Mint */}
                    <div className="retro-panel">
                        <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
                        <div style={{ fontFamily: 'var(--font-terminal)', color: 'var(--color-neon-red)', fontSize: '1.3rem', marginBottom: '1rem' }}>
                            💰 YOUR HFG BALANCE
                        </div>
                        {address ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '3rem', color: 'var(--color-neon-green)', textAlign: 'center' }} className="text-glow-green">
                                    {balance ?? '...'}
                                </div>
                                <div style={{ textAlign: 'center', color: 'rgba(57,255,20,0.5)', fontSize: '1.2rem', fontFamily: 'var(--font-terminal)' }}>HFG</div>
                                <div style={{ textAlign: 'center', color: 'rgba(57,255,20,0.4)', fontSize: '0.7rem', marginTop: '0.3rem', fontFamily: 'var(--font-mono)' }}>
                                    {address.slice(0, 8)}...{address.slice(-6)}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <WalletConnect />
                                <div style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Connect wallet to see balance</div>
                            </div>
                        )}

                        <div style={{ fontFamily: 'var(--font-terminal)', color: 'var(--color-amber)', fontSize: '1.1rem', marginBottom: '0.7rem' }}>
                            ⚡ REQUEST FREE TOKENS
                        </div>
                        <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.7rem' }}>
                            <input className="retro-input" type="number" min="1" max="1000" value={mintAmount}
                                onChange={e => setMintAmount(e.target.value)} placeholder="100" id="mint-amount-input" style={{ flex: 1 }} />
                            <button className="btn-amber" onClick={handlePublicMint} disabled={loading} id="mint-btn" style={{ flexShrink: 0 }}>
                                {loading ? 'MINTING...' : '[ MINT HFG ]'}
                            </button>
                        </div>
                        <div style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                            Free testnet tokens. Max 1000 HFG per transaction.
                        </div>
                        {mintHash && (
                            <a href={`https://sepolia.etherscan.io/tx/${mintHash}`} target="_blank" rel="noreferrer"
                                style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-neon-blue)', textDecoration: 'none', fontSize: '0.75rem' }}>
                                TX: {mintHash.slice(0, 14)}... [↗ ETHERSCAN]
                            </a>
                        )}
                    </div>
                </div>

                {/* Terminal log */}
                {log.length > 0 && (
                    <div className="terminal-output" style={{ marginTop: '1.5rem' }}>
                        {log.map((l, i) => (
                            <span key={i} className={`terminal-line ${l.type}`}>{l.text}</span>
                        ))}
                    </div>
                )}

                {/* Deploy instructions */}
                {isPlaceholder && (
                    <div className="retro-panel" style={{ marginTop: '1.5rem', borderColor: 'rgba(255,176,0,0.4)' }}>
                        <div className="corner tl" style={{ background: 'var(--color-amber)' }} /><div className="corner tr" style={{ background: 'var(--color-amber)' }} /><div className="corner bl" style={{ background: 'var(--color-amber)' }} /><div className="corner br" style={{ background: 'var(--color-amber)' }} />
                        <div style={{ fontFamily: 'var(--font-terminal)', color: 'var(--color-amber)', fontSize: '1.2rem', marginBottom: '0.7rem' }}>
                            ⚠ CONTRACT NOT YET DEPLOYED
                        </div>
                        <div className="terminal-output">
                            <span className="terminal-line warn">&gt; To deploy HellfireGold to Sepolia:</span>
                            <span className="terminal-line">1. Add your private key to hell/.env</span>
                            <span className="terminal-line">2. Get Sepolia ETH from https://sepoliafaucet.com</span>
                            <span className="terminal-line">3. Run: npm install (from hell/ folder)</span>
                            <span className="terminal-line">4. Run: npx hardhat run scripts/deploy.js --network sepolia</span>
                            <span className="terminal-line info">&gt; Contract address will auto-update in frontend/.env.local</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
