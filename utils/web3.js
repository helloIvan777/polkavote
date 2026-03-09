/**
 * PolkaVote Web3 Contract Utilities
 * Uses ethers.js v6 for blockchain interactions
 */

import { ethers } from 'ethers';

export const POLKAVOTE_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "string", "name": "_category", "type": "string" },
      { "internalType": "uint256", "name": "_durationInDays", "type": "uint256" }
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
      { "internalType": "string[]", "name": "categories", "type": "string[]" },
      { "internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "timestamps", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "deadlines", "type": "uint256[]" }
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

// ⚠️  VERIFY THIS ADDRESS on https://moonbase.moonscan.io before deploying.
// The address below was provided by the user. Note: a valid EVM address is
// exactly 40 hex characters after '0x'. Double-check if calls fail.
export const CONTRACT_ADDRESS = "0x5773B35548A7ed7B6F5DF5A05AfcA27D473A6D26";

// Moonbase Alpha RPC endpoints — blastapi is primary for read-only (more stable),
// official endpoint kept as signer provider fallback.
const RPC_URLS = [
  "https://moonbase-alpha.public.blastapi.io",
  "https://rpc.api.moonbase.moonbeam.network",
];

/** BrowserProvider (wallet) when available, else JsonRpc fallback. */
export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  const provider = new ethers.JsonRpcProvider(RPC_URLS[1]);
  provider.pollingInterval = 4000;
  return provider;
}

/**
 * Always returns a stable JsonRpcProvider for read-only calls.
 * Never depends on window.ethereum — works before the extension is ready.
 */
export function getReadOnlyProvider() {
  const provider = new ethers.JsonRpcProvider(RPC_URLS[0]);
  provider.pollingInterval = 4000;
  return provider;
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
  const provider = getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAVOTE_ABI, provider);
}

/** Create a read-only contract bound to a specific RPC URL (used for fallback). */
function createReadOnlyContract(rpcUrl) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  provider.pollingInterval = 4000;
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAVOTE_ABI, provider);
}

export async function addProposal(title, description, category, durationInDays, signer) {
  console.log('========================================');
  console.log('[web3.js] addProposal called');
  console.log('[web3.js] Title:', title, '| Category:', category, '| Duration:', durationInDays, 'days');
  console.log('[web3.js] Contract address:', CONTRACT_ADDRESS);
  console.log('========================================');

  try {
    if (!title || !title.trim()) throw new Error('Title is empty or missing');
    if (!description || !description.trim()) throw new Error('Description is empty or missing');
    if (title.length > 200) throw new Error(`Title too long: ${title.length} characters (max 200)`);
    if (description.length > 1000) throw new Error(`Description too long: ${description.length} characters (max 1000)`);
    if (!category || !category.trim()) throw new Error('Category is required');
    if (!durationInDays || durationInDays < 1 || durationInDays > 30) throw new Error('Duration must be 1–30 days');
    if (!signer) throw new Error('Wallet not connected. Please connect your wallet first.');

    const contract = getContract(signer);
    console.log('[web3.js] Sending transaction...');

    const tx = await contract.addProposal(
      title.trim(), description.trim(), category.trim(), durationInDays,
      { gasLimit: 3000000 }
    );

    console.log('[web3.js] Transaction sent:', tx.hash);
    console.log('[web3.js] Transaction gas limit:', tx.gasLimit?.toString());
    console.log('[web3.js] Transaction gas price:', tx.gasPrice?.toString());
    console.log('[web3.js] Waiting for confirmation...');

    // --- Receipt polling (wrapped separately) ---
    // Moonbase Alpha's RPC can be slow to serve eth_getTransactionReceipt.
    // If the poll fails with a network/fetch error the transaction has still
    // been accepted by the chain, so we return a graceful "pending" success
    // rather than crashing the UI.
    let receipt;
    try {
      receipt = await tx.wait();
    } catch (waitError) {
      const msg = waitError?.message?.toLowerCase() ?? '';
      const isFetchError =
        msg.includes('failed to fetch') ||
        msg.includes('fetch failed') ||
        msg.includes('network error') ||
        msg.includes('etimedout') ||
        waitError?.code === 'NETWORK_ERROR' ||
        waitError?.code === 'TIMEOUT';

      if (isFetchError) {
        console.warn('[web3.js] tx.wait() hit a fetch error — transaction was sent OK.', waitError);
        console.warn('[web3.js] TX Hash:', tx.hash);
        return {
          success: true,
          pending: true,
          txHash: tx.hash,
          proposalId: null,
          message:
            'Transaction sent! It might take a minute to appear on the site due to network congestion.',
        };
      }

      // Any other error (e.g. transaction reverted on-chain) — re-throw
      // so the outer catch can surface it to the user.
      throw waitError;
    }

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
      pending: false,
      txHash: receipt.hash,
      proposalId,
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

    const tx = await contract.vote(proposalId, {
      gasLimit: 1000000
    });

    console.log('[web3.js] Vote transaction sent:', tx.hash);

    // --- Receipt polling (separate try/catch) ---
    // Moonbase Alpha's RPC can time out on eth_getTransactionReceipt even
    // when the tx was accepted. Treat fetch/timeout as a pending success
    // so the UI doesn't show a false "Failed" alert.
    let receipt;
    try {
      receipt = await tx.wait();
    } catch (waitError) {
      const msg = waitError?.message?.toLowerCase() ?? '';
      const isFetchError =
        msg.includes('failed to fetch') ||
        msg.includes('fetch failed') ||
        msg.includes('network error') ||
        msg.includes('etimedout') ||
        waitError?.code === 'NETWORK_ERROR' ||
        waitError?.code === 'TIMEOUT';

      if (isFetchError) {
        console.warn('[web3.js] tx.wait() timed out — vote was sent OK. TX:', tx.hash);
        return {
          success: true,
          pending: true,
          txHash: tx.hash,
          message: 'Vote sent! It will appear after the next block.',
        };
      }
      // On-chain revert or other hard error — surface it
      throw waitError;
    }

    console.log('[web3.js] Vote confirmed:', receipt.hash);
    return {
      success: true,
      pending: false,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error('[web3.js] voteOnProposal error:', error);

    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    if (error.message?.includes('Already voted')) {
      throw new Error('You have already voted on this proposal');
    }
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas. Add DEV tokens to your wallet.');
    }

    throw error;
  }
}

export async function fetchAllProposals() {
  console.log('========================================');
  console.log('[web3.js] fetchAllProposals called');
  console.log('[web3.js] Contract Address:', CONTRACT_ADDRESS);
  console.log('[web3.js] Will try RPCs:', RPC_URLS);
  console.log('========================================');

  let lastError;

  // Try each RPC endpoint in sequence — return on the first that works.
  for (const rpcUrl of RPC_URLS) {
    try {
      console.log('[web3.js] Trying RPC:', rpcUrl);
      const contract = createReadOnlyContract(rpcUrl);
      const result = await contract.getAllProposals();

      const [ids, proposers, titles, descriptions, categories, voteCounts, timestamps, deadlines] = result;

      if (!ids || ids.length === 0) {
        console.log('[web3.js] Contract has 0 proposals — returning empty array.');
        return [];
      }

      console.log('[web3.js] Fetched', ids.length, 'proposals via', rpcUrl);

      return ids.map((id, index) => ({
        id: Number(id),
        proposer: proposers[index],
        title: titles[index],
        description: descriptions[index],
        category: categories[index] || 'Tech',
        voteCount: Number(voteCounts[index]),
        timestamp: Number(timestamps[index]) * 1000,
        deadline: Number(deadlines[index]) * 1000, // convert to ms
        hasVoted: false
      }));
    } catch (err) {
      console.warn('[web3.js] RPC failed:', rpcUrl, '—', err.message);
      lastError = err;
      // Continue to next RPC
    }
  }

  // All RPCs failed — surface a clear error
  console.error('========================================');
  console.error('[web3.js] fetchAllProposals FAILED on all RPCs');
  console.error('[web3.js] Contract Address:', CONTRACT_ADDRESS);
  console.error('[web3.js] Last error:', lastError?.message);
  console.error('========================================');

  const msg = lastError?.message?.toLowerCase() ?? '';
  if (msg.includes('bad address') || msg.includes('invalid address') || msg.includes('could not decode')) {
    throw new Error(
      `Invalid contract address (${CONTRACT_ADDRESS}). ` +
      'Verify it on moonbase.moonscan.io and update CONTRACT_ADDRESS in utils/web3.js.'
    );
  }
  // Only flag as network error on explicit fetch/timeout failures
  if (msg.includes('failed to fetch') || msg.includes('fetch failed') || msg.includes('etimedout') || lastError?.code === 'TIMEOUT') {
    throw new Error('Could not reach Moonbase Alpha. Check your internet connection and try again.');
  }
  throw lastError;
}

export async function checkVoted(proposalId, voterAddress) {
  for (const rpcUrl of RPC_URLS) {
    try {
      const contract = createReadOnlyContract(rpcUrl);
      return await contract.checkVoted(proposalId, voterAddress);
    } catch (err) {
      console.warn('[web3.js] checkVoted RPC failed:', rpcUrl, '—', err.message);
    }
  }
  // All failed — default to false so the vote button still works
  return false;
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
