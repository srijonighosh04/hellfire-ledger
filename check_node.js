const { ethers } = require('ethers');
async function test() {
    try {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const network = await provider.getNetwork();
        console.log('Network OK:', network.chainId);
        
        const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            console.log('ERROR: No contract deployed at ' + contractAddress);
        } else {
            console.log('Contract IS deployed.');
            
            // Check balance of Account 0
            const HFG_ABI = ['function balanceOf(address) view returns (uint256)', 'function symbol() view returns (string)'];
            const token = new ethers.Contract(contractAddress, HFG_ABI, provider);
            
            const symbol = await token.symbol();
            console.log('Token Symbol:', symbol);
            
            const acc0 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
            const bal0 = await token.balanceOf(acc0);
            console.log(`Account 0 (${acc0}) Balance:`, ethers.formatUnits(bal0, 18), symbol);
            
            const acc1 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
            const bal1 = await token.balanceOf(acc1);
            console.log(`Account 1 (${acc1}) Balance:`, ethers.formatUnits(bal1, 18), symbol);
        }
    } catch (e) {
        console.log('ERROR connecting to node:', e.message);
    }
}
test();
