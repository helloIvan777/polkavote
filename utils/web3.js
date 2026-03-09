/**
 * PolkaVote Web3 Contract Utilities
 * Uses ethers.js v6 for blockchain interactions
 * 
 * NOTE: For wallet connection, use the useWeb3() hook from context/Web3Context.js
 * These utilities are for contract interactions only.
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

// Contract Address - REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESS
export const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS";

// Default RPC URL (Polygon Mumbai testnet - change for production)
const DEFAULT_RPC_URL = "https://rpc-mumbai.maticvigil.com";

/**
 * Get a read-only provider instance
 */
export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
}

/**
 * Get contract instance with signer for write operations
 */
export function getContract(signer) {
  console.log('[web3.js] getContract called, has signer:', !!signer);
  console.log('[web3.js] Contract address:', CONTRACT_ADDRESS);
  
  if (!signer) {
    console.error('[web3.js] ERROR: No signer provided to getContract');
    throw new Error('Signer is required for contract interactions');
  }
  
  const contract = new ethers.Contract(CONTRACT_ADDRESS, POLKAVOTE_ABI, signer);
  console.log('[web3.js] Contract instance created');
  return contract;
}

/**
 * Get read-only contract instance (for view functions)
 */
export function getReadOnlyContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAVOTE_ABI, provider);
}

/**
 * Add a new proposal to the contract
 * INCLUDES DETAILED ERROR LOGGING FOR DEBUGGING
 */
export async function addProposal(title, description, signer) {
  console.log('========================================');
  console.log('[web3.js] addProposal called');
  console.log('[web3.js] Title:', title);
  console.log('[web3.js] Description:', description);
  console.log('[web3.js] Has signer:', !!signer);
  console.log('[web3.js] Contract address:', CONTRACT_ADDRESS);
  console.log('========================================');

  // Validate inputs
  if (!title || !title.trim()) {
    console.error('[web3.js] ERROR: Title is empty');
    throw new Error('Title is required');
  }
  
  if (!description || !description.trim()) {
    console.error('[web3.js] ERROR: Description is empty');
    throw new Error('Description is required');
  }

  if (title.length > 200) {
    console.error('[web3.js] ERROR: Title too long:', title.length);
    throw new Error('Title must be 200 characters or less');
  }

  if (description.length > 1000) {
    console.error('[web3.js] ERROR: Description too long:', description.length);
    throw new Error('Description must be 1000 characters or less');
  }

  if (!signer) {
    console.error('[web3.js] ERROR: No signer provided');
    throw new Error('Wallet not connected. Please connect your wallet first.');
  }

  try {
    console.log('[web3.js] Creating contract instance...');
    const contract = getContract(signer);
    
    console.log('[web3.js] Estimating gas for addProposal...');
    
    // Send transaction
    console.log('[web3.js] Sending transaction...');
    const tx = await contract.addProposal(title.trim(), description.trim());
    console.log('[web3.js] Transaction sent:', tx.hash);
    console.log('[web3.js] Waiting for confirmation...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('[web3.js] Transaction confirmed:', receipt.hash);
    console.log('[web3.js] Block number:', receipt.blockNumber);
    
    // Find the ProposalCreated event
    console.log('[web3.js] Looking for ProposalCreated event...');
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        console.log('[web3.js] Parsed log:', parsed?.name);
        return parsed && parsed.name === 'ProposalCreated';
      } catch (e) {
        return false;
      }
    });
    
    const proposalId = event ? Number(event.args[0]) : null;
    console.log('[web3.js] Proposal ID:', proposalId);
    
    console.log('========================================');
    console.log('[web3.js] addProposal SUCCESS');
    console.log('[web3.js] Proposal ID:', proposalId);
    console.log('[web3.js] TX Hash:', receipt.hash);
    console.log('========================================');
    
    return {
      success: true,
      txHash: receipt.hash,
      proposalId
    };
  } catch (error) {
    console.error('========================================');
    console.error('[web3.js] addProposal FAILED');
    console.error('[web3.js] Error name:', error.name);
    console.error('[web3.js] Error message:', error.message);
    console.error('[web3.js] Error code:', error.code);
    console.error('[web3.js] Full error:', error);
    console.error('========================================');
    
    // Provide user-friendly error messages
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas. Please add ETH to your wallet.');
    }
    
    if (error.message?.includes('contract not deployed')) {
      throw new Error('Contract not deployed at the specified address. Please check the contract address.');
    }
    
    if (error.message?.includes('CONTRACT_ADDRESS')) {
      throw new Error('Contract address not configured. Please set CONTRACT_ADDRESS in utils/web3.js');
    }
    
    throw error;
  }
}

/**
 * Vote on a proposal
 */
export async function voteOnProposal(proposalId, signer) {
  console.log('[web3.js] voteOnProposal called, proposalId:', proposalId);

  if (!signer) {
    throw new Error('Wallet not connected');
  }

  try {
    const contract = getContract(signer);
    const tx = await contract.vote(proposalId);
    const receipt = await tx.wait();
    
    console.log('[web3.js] Vote confirmed:', receipt.hash);
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('[web3.js] voteOnProposal error:', error);
    
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    
    if (error.message?.includes('Already voted')) {
      throw new Error('You have already voted on this proposal');
    }
    
    throw error;
  }
}

/**
 * Fetch all proposals from the contract
 */
export async function fetchAllProposals() {
  console.log('[web3.js] fetchAllProposals called');
  
  try {
    const contract = getReadOnlyContract();
    const result = await contract.getAllProposals();
    
    const [ids, proposers, titles, descriptions, voteCounts, timestamps] = result;
    
    console.log('[web3.js] Fetched', ids.length, 'proposals');
    
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
    console.error('[web3.js] fetchAllProposals error:', error);
    throw error;
  }
}

/**
 * Check if an address has voted on a proposal
 */
export async function checkVoted(proposalId, voterAddress) {
  try {
    const contract = getReadOnlyContract();
    return await contract.checkVoted(proposalId, voterAddress);
  } catch (error) {
    console.error('[web3.js] checkVoted error:', error);
    return false;
  }
}

/**
 * Get proposal count
 */
export async function getProposalCount() {
  try {
    const contract = getReadOnlyContract();
    const count = await contract.getProposalCount();
    return Number(count);
  } catch (error) {
    console.error('[web3.js] getProposalCount error:', error);
    return 0;
  }
}

/**
 * Get total votes across all proposals
 */
export async function getTotalVotes() {
  try {
    const contract = getReadOnlyContract();
    const total = await contract.getTotalVotes();
    return Number(total);
  } catch (error) {
    console.error('[web3.js] getTotalVotes error:', error);
    return 0;
  }
}

/**
 * Format a large number with K/M suffix
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
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Truncate an Ethereum address
 */
export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
