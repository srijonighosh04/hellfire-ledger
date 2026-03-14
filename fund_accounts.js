const hre = require("hardhat");

async function main() {
    const addresses = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Account 0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account 1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account 2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account 3
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Account 4
    ];

    const Contract = await hre.ethers.getContractFactory("HellfireGold");
    // Get the locally deployed contract (assuming it's fixed at this address on fresh deploy)
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const token = await Contract.attach(contractAddress);

    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Funding accounts with HFG...");
    
    for (let i = 1; i < addresses.length; i++) {
        const to = addresses[i];
        try {
            const tx = await token.transfer(to, hre.ethers.parseEther("1000"));
            await tx.wait();
            console.log(`Sent 1000 HFG to ${to}`);
        } catch (e) {
            console.log(`Failed to send to ${to}: ${e.message}`);
        }
    }
    console.log("Done funding.");
}

main().catch(console.error);
