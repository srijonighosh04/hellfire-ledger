// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HellfireGold
 * @notice The official ERC-20 token of the Hellfire Club D&D Inventory.
 *         Players use HFG to settle debts on the immutable blockchain ledger.
 * @dev Deployed on Sepolia testnet for the IIT BBSR Hackathon.
 */
contract HellfireGold is ERC20, Ownable {
    // Track all participants who have received tokens
    address[] private _participants;
    mapping(address => bool) private _isParticipant;

    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event DebtSettled(address indexed from, address indexed to, uint256 amount);

    constructor(address initialOwner) 
        ERC20("Hellfire Gold", "HFG") 
        Ownable(initialOwner) 
    {
        // Mint initial supply of 100,000 HFG to deployer
        uint256 initialSupply = 100_000 * 10 ** decimals();
        _mint(initialOwner, initialSupply);
        _addParticipant(initialOwner);
        
        emit TokensMinted(initialOwner, initialSupply, "INITIAL_SUPPLY");
    }

    /**
     * @notice Mint new HFG tokens to a participant.
     * @dev Only the contract owner can mint tokens.
     * @param to Address to receive the minted tokens
     * @param amount Amount in HFG (will be scaled by decimals() = 18)
     * @param reason Human-readable reason for minting (e.g., "SETTLEMENT_CREDIT")
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be positive");
        
        _mint(to, amount * 10 ** decimals());
        _addParticipant(to);
        
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @notice Public mint for hackathon demo — allows anyone to request HFG tokens.
     * @dev Capped at 1,000 HFG per call. Safe for testnet demo purposes.
     * @param amount Amount of HFG to mint (max 1000)
     */
    function publicMint(uint256 amount) external {
        require(amount > 0 && amount <= 1000, "Amount must be between 1 and 1000 HFG");
        
        _mint(msg.sender, amount * 10 ** decimals());
        _addParticipant(msg.sender);
        
        emit TokensMinted(msg.sender, amount, "PUBLIC_MINT");
    }

    /**
     * @notice Settle a debt by transferring HFG from caller to recipient.
     * @param to Recipient address
     * @param amount Raw token amount (in wei, 18 decimals)
     */
    function settleDebt(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot settle to zero address");
        require(amount > 0, "Settlement amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient HFG balance");

        bool success = transfer(to, amount);
        if (success) {
            _addParticipant(to);
            emit DebtSettled(msg.sender, to, amount);
        }
        return success;
    }

    /**
     * @notice Get HFG balance formatted as a human-readable number.
     * @param account Address to query
     * @return balance Balance in HFG (divided by 10^18)
     */
    function balanceHFG(address account) external view returns (uint256) {
        return balanceOf(account) / 10 ** decimals();
    }

    /**
     * @notice Get list of all participants who have held HFG.
     */
    function getParticipants() external view returns (address[] memory) {
        return _participants;
    }

    /**
     * @dev Internal helper to track new participants.
     */
    function _addParticipant(address addr) internal {
        if (!_isParticipant[addr]) {
            _isParticipant[addr] = true;
            _participants.push(addr);
        }
    }
}
