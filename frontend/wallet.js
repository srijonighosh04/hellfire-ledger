/**
 * wallet.js — MetaMask / ethers.js integration helper
 */
import { BrowserProvider } from 'ethers';

let provider = null;

export async function connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask to continue.');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new BrowserProvider(window.ethereum);

    // Switch to Localhost if not already on it
    try {
        await switchToLocalhost();
    } catch (e) {
        console.warn('Could not auto-switch network:', e.message);
    }

    return provider;
}

export async function getConnectedAddress() {
    if (!provider) return null;
    const signer = await provider.getSigner();
    return signer.getAddress();
}

export async function getSigner() {
    if (!provider) throw new Error('Wallet not connected');
    return provider.getSigner();
}

export async function switchToLocalhost() {
    if (!window.ethereum) return;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7a69' }], // Hardhat local chain ID (31337) in hex
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x7a69',
                    chainName: 'Hardhat Localhost',
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['http://127.0.0.1:8545'],
                }],
            });
        } else {
            throw switchError;
        }
    }
}
