const hre = require('hardhat');
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log('\n🔥 ======================================');
    console.log('   HELLFIRE GOLD DEPLOYMENT SCRIPT');
    console.log('=========================================');
    console.log(`Deploying with account: ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

    console.log('\n⚡ Deploying HellfireGold contract...');

    const HellfireGold = await ethers.getContractFactory('HellfireGold');
    const hellfireGold = await HellfireGold.deploy(deployer.address);

    await hellfireGold.waitForDeployment();

    const contractAddress = await hellfireGold.getAddress();

    console.log(`\n✅ HellfireGold deployed to: ${contractAddress}`);
    console.log(`\n🔗 Etherscan (Sepolia): https://sepolia.etherscan.io/address/${contractAddress}`);

    // Verify initial state
    const totalSupply = await hellfireGold.totalSupply();
    console.log(`\n💰 Total HFG supply: ${ethers.formatEther(totalSupply)} HFG`);

    // Write contract address to a JSON file for the frontend to use
    const fs = require('fs');
    const path = require('path');

    const deploymentInfo = {
        network: hre.network.name,
        contractAddress,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        totalSupply: ethers.formatEther(totalSupply),
    };

    // Write to root deployment file
    fs.writeFileSync(
        path.join(__dirname, 'deployment.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Also write to frontend .env.local for immediate use
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');
    const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\nNEXT_PUBLIC_NETWORK=sepolia\nNEXT_PUBLIC_BACKEND_URL=http://localhost:4000\n`;
    fs.writeFileSync(frontendEnvPath, envContent);

    console.log('\n📄 Deployment info saved to deployment.json');
    console.log(`📄 Frontend .env.local updated with contract address`);
    console.log('\n🎉 DEPLOY COMPLETE — HELLFIRE MAINFRAME SECURED ON CHAIN\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ DEPLOY FAILED:', error);
        process.exit(1);
    });
