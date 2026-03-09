/**
 * PolkaVote Web3 Contract Utilities
 * Uses ethers.js v6 for blockchain interactions
 */

import { ethers } from 'ethers';

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

// Moonbase Alpha Contract Address
export const CONTRACT_ADDRESS = "0xf9810bA1557354F3a6314992d896ACeCD05210b5";

// Moonbase Alpha RPC URL
const DEFAULT_RPC_URL = "https://rpc.api.moonbase.moonbeam.network";

export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
}

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

export function getReadOnlyContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAVOTE_ABI, provider);
}

export async function addProposal(title, description, signer) {
  console.log('========================================');
  console.log('[web3.js] addProposal called');
  console.log('[web3.js] Title:', title);
  console.log('[web3.js] Description:', description);
  console.log('[web3.js] Has signer:', !!signer);
  console.log('[web3.js] Contract address:', CONTRACT_ADDRESS);
  console.log('[web3.js] Signer type:', typeof signer);
  console.log('[web3.js] Signer constructor:', signer?.constructor?.name);
  console.log('========================================');

  try {
    // Validate inputs
    if (!title || !title.trim()) {
      const errorMsg = 'Title is empty or missing';
      console.error('[web3.js] VALIDATION ERROR:', errorMsg);
      throw new Error(errorMsg);
    }

    if (!description || !description.trim()) {
      const errorMsg = 'Description is empty or missing';
      console.error('[web3.js] VALIDATION ERROR:', errorMsg);
      throw new Error(errorMsg);
    }

    if (title.length > 200) {
      const errorMsg = `Title too long: ${title.length} characters (max 200)`;
      console.error('[web3.js] VALIDATION ERROR:', errorMsg);
      throw new Error(errorMsg);
    }

    if (description.length > 1000) {
      const errorMsg = `Description too long: ${description.length} characters (max 1000)`;
      console.error('[web3.js] VALIDATION ERROR:', errorMsg);
      throw new Error(errorMsg);
    }

    if (!signer) {
      const errorMsg = 'No signer provided. Wallet not connected.';
      console.error('[web3.js] VALIDATION ERROR:', errorMsg);
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    console.log('[web3.js] Creating contract instance...');
    const contract = getContract(signer);
    console.log('[web3.js] Contract instance:', contract?.address);

    console.log('[web3.js] Sending transaction...');
    const tx = await contract.addProposal(title.trim(), description.trim());
    console.log('[web3.js] Transaction sent:', tx.hash);
    console.log('[web3.js] Transaction gas limit:', tx.gasLimit?.toString());
    console.log('[web3.js] Transaction gas price:', tx.gasPrice?.toString());
    console.log('[web3.js] Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('[web3.js] Transaction confirmed:', receipt.hash);
    console.log('[web3.js] Block number:', receipt.blockNumber);
    console.log('[web3.js] Gas used:', receipt.gasUsed?.toString());
    console.log('[web3.js] Status:', receipt.status);

    console.log('[web3.js] Looking for ProposalCreated event...');
    let proposalId = null;
    
    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          console.log('[web3.js] Parsed log:', parsed?.name, parsed?.args);
          if (parsed && parsed.name === 'ProposalCreated') {
            proposalId = Number(parsed.args[0]);
            console.log('[web3.js] Found ProposalCreated event, proposalId:', proposalId);
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }
    }

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
    console.error('[web3.js] Error reason:', error.reason);
    console.error('[web3.js] Error stack:', error.stack);
    console.error('[web3.js] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('========================================');

    // Provide user-friendly error messages based on exact error details
    if (error.code === 4001) {
      const userMsg = 'Transaction rejected by user';
      console.error('[web3.js] USER ERROR:', userMsg);
      throw new Error(userMsg);
    }

    if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
      const userMsg = 'Insufficient funds for gas. Please add DEV tokens to your wallet.';
      console.error('[web3.js] USER ERROR:', userMsg);
      throw new Error(userMsg);
    }

    if (error.code === 'UNPREDICTABLE_GAS_LIMIT' || error.message?.includes('gas required exceeds')) {
      const userMsg = 'Transaction execution failed. The contract may have rejected this transaction.';
      console.error('[web3.js] USER ERROR:', userMsg);
      throw new Error(userMsg);
    }

    if (error.message?.includes('contract not deployed') || error.message?.includes('not deployed')) {
      const userMsg = 'Contract not deployed at the specified address. Please verify the contract address.';
      console.error('[web3.js] USER ERROR:', userMsg);
      throw new Error(userMsg);
    }

    if (error.message?.includes('NETWORK_ERROR') || error.message?.includes('network')) {
      const userMsg = 'Network error. Please check your connection and try again.';
      console.error('[web3.js] USER ERROR:', userMsg);
      throw new Error(userMsg);
    }

    if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
      const userMsg = 'Transaction timed out. Please try again.';
      console.error('[web3.js] USER ERROR:', userMsg);
      throw new Error(userMsg);
    }

    // Default: throw the original error with message
    const userMsg = error.message || 'Failed to submit proposal. Please try again.';
    console.error('[web3.js] USER ERROR:', userMsg);
    throw new Error(userMsg);
  }
}

export async function voteOnProposal(proposalId, signer) {
  console.log('[web3.js] voteOnProposal called, proposalId:', proposalId);
  console.log('[web3.js] Has signer:', !!signer);

  if (!signer) {
    console.error('[web3.js] ERROR: No signer provided');
    throw new Error('Wallet not connected');
  }

  try {
    const contract = getContract(signer);
    const tx = await contract.vote(proposalId);
    console.log('[web3.js] Vote transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('[web3.js] Vote confirmed:', receipt.hash);

    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('[web3.js] voteOnProposal error:', error);
    console.error('[web3.js] Error name:', error.name);
    console.error('[web3.js] Error message:', error.message);
    console.error('[web3.js] Error code:', error.code);

    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }

    if (error.message?.includes('Already voted')) {
      throw new Error('You have already voted on this proposal');
    }

    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas');
    }

    throw error;
  }
}

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
      timestamp: Number(timestamps[index]) * 1000,
      hasVoted: false
    }));
  } catch (error) {
    console.error('[web3.js] fetchAllProposals error:', error);
    console.error('[web3.js] Error name:', error.name);
    console.error('[web3.js] Error message:', error.message);
    throw error;
  }
}

export async function checkVoted(proposalId, voterAddress) {
  try {
    const contract = getReadOnlyContract();
    return await contract.checkVoted(proposalId, voterAddress);
  } catch (error) {
    console.error('[web3.js] checkVoted error:', error);
    return false;
  }
}

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

export function formatVoteCount(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

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

export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
