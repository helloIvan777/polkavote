/**
 * PolkaVote Web3 Integration Utilities
 * Uses ethers.js v6 for blockchain interactions
 */

import { ethers } from 'ethers';

// Contract ABI - Generated from PolkaVote.sol
export const POLKAVOTE_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" }
    ],
    "name": "addProposal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_proposalId", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProposals",
    "outputs": [
      { "internalType": "uint256[]", "name": "ids", "type": "uint256[]" },
      { "internalType": "address[]", "name": "proposers", "type": "address[]" },
      { "internalType": "string[]", "name": "titles", "type": "string[]" },
      { "internalType": "string[]", "name": "descriptions", "type": "string[]" },
      { "internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "timestamps", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_proposalId", "type": "uint256" }],
    "name": "getProposal",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "proposer", "type": "address" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "voteCount", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVotes",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" },
      { "internalType": "address", "name": "_voter", "type": "address" }
    ],
    "name": "checkVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "voter", "type": "address" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
];

// Contract Address - Replace with your deployed contract address
export const POLKAVOTE_ADDRESS = "0xYOUR_CONTRACT_ADDRESS";

// Default RPC URL (Polygon Mumbai testnet - change for production)
const DEFAULT_RPC_URL = "https://rpc-mumbai.maticvigil.com";

/**
 * Get a provider instance
 * @returns {ethers.Provider} The provider instance
 */
export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<{signer: ethers.Signer, address: string, chainId: number}>}
 */
export async function connectWallet() {
  if (typeof window === 'undefined') {
    throw new Error('Not running in browser');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    
    return {
      signer,
      address,
      chainId: Number(network.chainId)
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection rejected by user');
    }
    throw error;
  }
}

/**
 * Get the current signer
 * @returns {Promise<ethers.Signer|null>} The signer or null if not connected
 */
export async function getSigner() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      return null;
    }
    return await provider.getSigner();
  } catch (error) {
    return null;
  }
}

/**
 * Fetch all proposals from the contract
 * @param {string} contractAddress - The contract address
 * @returns {Promise<Array>} Array of proposal objects
 */
export async function fetchAllProposals(contractAddress = POLKAVOTE_ADDRESS) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, POLKAVOTE_ABI, provider);
    
    const result = await contract.getAllProposals();
    
    const [ids, proposers, titles, descriptions, voteCounts, timestamps] = result;
    
    return ids.map((id, index) => ({
      id: Number(id),
      proposer: proposers[index],
      title: titles[index],
      description: descriptions[index],
      voteCount: Number(voteCounts[index]),
      timestamp: Number(timestamps[index]) * 1000, // Convert to milliseconds
      hasVoted: false // Will be set separately
    }));
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}

/**
 * Submit a new proposal
 * @param {string} title - The proposal title
 * @param {string} description - The proposal description
 * @param {ethers.Signer} signer - The signer instance
 * @param {string} contractAddress - The contract address
 * @returns {Promise<object>} Transaction receipt
 */
export async function submitProposal(title, description, signer, contractAddress = POLKAVOTE_ADDRESS) {
  try {
    const contract = new ethers.Contract(contractAddress, POLKAVOTE_ABI, signer);
    
    const tx = await contract.addProposal(title, description);
    const receipt = await tx.wait();
    
    // Find the ProposalCreated event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'ProposalCreated';
      } catch {
        return false;
      }
    });
    
    return {
      success: true,
      txHash: receipt.hash,
      proposalId: event ? Number(event.args[0]) : null
    };
  } catch (error) {
    console.error('Error submitting proposal:', error);
    throw error;
  }
}

/**
 * Vote on a proposal
 * @param {number} proposalId - The proposal ID to vote on
 * @param {ethers.Signer} signer - The signer instance
 * @param {string} contractAddress - The contract address
 * @returns {Promise<object>} Transaction receipt
 */
export async function voteOnProposal(proposalId, signer, contractAddress = POLKAVOTE_ADDRESS) {
  try {
    const contract = new ethers.Contract(contractAddress, POLKAVOTE_ABI, signer);
    
    const tx = await contract.vote(proposalId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error voting on proposal:', error);
    throw error;
  }
}

/**
 * Check if an address has voted on a proposal
 * @param {number} proposalId - The proposal ID
 * @param {string} voterAddress - The voter's address
 * @param {string} contractAddress - The contract address
 * @returns {Promise<boolean>} True if already voted
 */
export async function checkVoted(proposalId, voterAddress, contractAddress = POLKAVOTE_ADDRESS) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, POLKAVOTE_ABI, provider);
    
    return await contract.checkVoted(proposalId, voterAddress);
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

/**
 * Get proposal count
 * @param {string} contractAddress - The contract address
 * @returns {Promise<number>} The number of proposals
 */
export async function getProposalCount(contractAddress = POLKAVOTE_ADDRESS) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, POLKAVOTE_ABI, provider);
    
    const count = await contract.getProposalCount();
    return Number(count);
  } catch (error) {
    console.error('Error getting proposal count:', error);
    return 0;
  }
}

/**
 * Get total votes across all proposals
 * @param {string} contractAddress - The contract address
 * @returns {Promise<number>} The total vote count
 */
export async function getTotalVotes(contractAddress = POLKAVOTE_ADDRESS) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, POLKAVOTE_ABI, provider);
    
    const total = await contract.getTotalVotes();
    return Number(total);
  } catch (error) {
    console.error('Error getting total votes:', error);
    return 0;
  }
}

/**
 * Format a large number with K/M suffix
 * @param {number} num - The number to format
 * @returns {string} Formatted string
 */
export function formatVoteCount(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Format timestamp to relative time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'Just now';
}

/**
 * Truncate an Ethereum address
 * @param {string} address - The full address
 * @param {number} start - Characters to show at start
 * @param {number} end - Characters to show at end
 * @returns {string} Truncated address
 */
export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
