const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('HellfireGold ERC-20 Token', function () {
    let hellfireGold;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const HellfireGold = await ethers.getContractFactory('HellfireGold');
        hellfireGold = await HellfireGold.deploy(owner.address);
        await hellfireGold.waitForDeployment();
    });

    describe('Deployment', function () {
        it('Should have the correct name and symbol', async function () {
            expect(await hellfireGold.name()).to.equal('Hellfire Gold');
            expect(await hellfireGold.symbol()).to.equal('HFG');
        });

        it('Should mint 100,000 HFG to deployer on deploy', async function () {
            const expectedSupply = ethers.parseUnits('100000', 18);
            expect(await hellfireGold.totalSupply()).to.equal(expectedSupply);
            expect(await hellfireGold.balanceOf(owner.address)).to.equal(expectedSupply);
        });

        it('Should set the correct owner', async function () {
            expect(await hellfireGold.owner()).to.equal(owner.address);
        });
    });

    describe('Owner Minting', function () {
        it('Owner can mint tokens to any address', async function () {
            await hellfireGold.mint(addr1.address, 500, 'TEST_MINT');
            const expected = ethers.parseUnits('500', 18);
            expect(await hellfireGold.balanceOf(addr1.address)).to.equal(expected);
        });

        it('Non-owner cannot call owner mint', async function () {
            await expect(
                hellfireGold.connect(addr1).mint(addr2.address, 100, 'HACK_ATTEMPT')
            ).to.be.reverted;
        });
    });

    describe('Public Minting', function () {
        it('Anyone can mint up to 1000 HFG via publicMint', async function () {
            await hellfireGold.connect(addr1).publicMint(500);
            const expected = ethers.parseUnits('500', 18);
            expect(await hellfireGold.balanceOf(addr1.address)).to.equal(expected);
        });

        it('Cannot publicMint more than 1000 HFG at once', async function () {
            await expect(hellfireGold.connect(addr1).publicMint(1001)).to.be.reverted;
        });

        it('Cannot publicMint 0 HFG', async function () {
            await expect(hellfireGold.connect(addr1).publicMint(0)).to.be.reverted;
        });
    });

    describe('Debt Settlement', function () {
        it('Can settle a debt by transferring HFG', async function () {
            // Give addr1 some HFG first
            await hellfireGold.connect(addr1).publicMint(100);

            const amountWei = ethers.parseUnits('50', 18);
            await hellfireGold.connect(addr1).settleDebt(addr2.address, amountWei);

            expect(await hellfireGold.balanceOf(addr2.address)).to.equal(amountWei);
        });

        it('Cannot settle debt with insufficient balance', async function () {
            const amountWei = ethers.parseUnits('100', 18);
            // addr1 has 0 HFG
            await expect(
                hellfireGold.connect(addr1).settleDebt(addr2.address, amountWei)
            ).to.be.reverted;
        });
    });

    describe('Balance Query', function () {
        it('balanceHFG returns human-readable balance', async function () {
            await hellfireGold.connect(addr1).publicMint(250);
            expect(await hellfireGold.balanceHFG(addr1.address)).to.equal(250n);
        });
    });

    describe('Participant Tracking', function () {
        it('Returns participants list', async function () {
            await hellfireGold.connect(addr1).publicMint(100);
            const participants = await hellfireGold.getParticipants();
            expect(participants).to.include(owner.address);
            expect(participants).to.include(addr1.address);
        });
    });
});
