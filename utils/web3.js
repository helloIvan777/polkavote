/**
 * PolkaFund Web3 Contract Utilities
 * Uses ethers.js v6 for blockchain interactions
 */

import { ethers } from 'ethers';

export const POLKAFUND_ABI = [
  // ── Write functions ──────────────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string",  "name": "_title",          "type": "string"  },
      { "internalType": "string",  "name": "_description",    "type": "string"  },
      { "internalType": "string",  "name": "_category",       "type": "string"  },
      { "internalType": "uint256", "name": "_targetAmount",   "type": "uint256" },
      { "internalType": "uint256", "name": "_durationInDays", "type": "uint256" }
    ],
    "name": "addProject",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ── View functions ───────────────────────────────────────────────────────
  {
    "inputs": [],
    "name": "getAllProjects",
    "outputs": [
      { "internalType": "uint256[]", "name": "ids",            "type": "uint256[]" },
      { "internalType": "address[]", "name": "creators",       "type": "address[]" },
      { "internalType": "string[]",  "name": "titles",         "type": "string[]"  },
      { "internalType": "string[]",  "name": "descriptions",   "type": "string[]"  },
      { "internalType": "string[]",  "name": "categories",     "type": "string[]"  },
      { "internalType": "uint256[]", "name": "targetAmounts",  "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "raisedAmounts",  "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "timestamps",     "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "deadlines",      "type": "uint256[]" },
      { "internalType": "bool[]",    "name": "withdrawnFlags", "type": "bool[]"    }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProjectCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    // Public mapping auto-getter: contributions[projectId][address] => uint256
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "contributions",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ── Events ───────────────────────────────────────────────────────────────
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "projectId",    "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "creator",      "type": "address" },
      { "indexed": false, "internalType": "string",  "name": "title",        "type": "string"  },
      { "indexed": false, "internalType": "uint256", "name": "targetAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "deadline",     "type": "uint256" }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "projectId",      "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "backer",         "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount",         "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newRaisedAmount","type": "uint256" }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "creator",   "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount",    "type": "uint256" }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "backer",    "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount",    "type": "uint256" }
    ],
    "name": "RefundClaimed",
    "type": "event"
  }
];

export const CONTRACT_ADDRESS = "0x8c26a85029118ebC1bc50F9B9a7CD1ea75a8f496";

// Moonbase Alpha RPC endpoints
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

export function getReadOnlyProvider() {
  const provider = new ethers.JsonRpcProvider(RPC_URLS[0]);
  provider.pollingInterval = 4000;
  return provider;
}

export function getContract(signer) {
  if (!signer) throw new Error('Signer is required for contract interactions');
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAFUND_ABI, signer);
}

export function getReadOnlyContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAFUND_ABI, getReadOnlyProvider());
}

function createReadOnlyContract(rpcUrl) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  provider.pollingInterval = 4000;
  return new ethers.Contract(CONTRACT_ADDRESS, POLKAFUND_ABI, provider);
}

// ── tx.wait() wrapper (handles Moonbase Alpha RPC timeouts gracefully) ───────
async function waitForTx(tx, pendingPayload) {
  try {
    const receipt = await tx.wait();
    return { receipt, pending: false };
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
      console.warn('[web3.js] tx.wait() hit a fetch error — tx was sent OK. Hash:', tx.hash);
      return { receipt: null, pending: true, txHash: tx.hash, ...pendingPayload };
    }
    throw waitError;
  }
}

// ── Standard error classifier ─────────────────────────────────────────────────
function classifyError(error, context = 'operation') {
  if (error.code === 4001) throw new Error('Transaction rejected by user');
  if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds'))
    throw new Error('Insufficient DEV tokens for gas. Add DEV to your wallet.');
  if (error.message?.includes('execution reverted') || error.message?.includes('revert'))
    throw new Error(error.reason || error.message || `Contract reverted during ${context}`);
  if (error.message?.includes('failed to fetch') || error.code === 'NETWORK_ERROR')
    throw new Error('Network error. Check your connection and try again.');
  throw new Error(error.message || `Failed to ${context}. Please try again.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// addProject
// ─────────────────────────────────────────────────────────────────────────────
export async function addProject(title, description, category, targetAmountDev, durationInDays, signer) {
  console.log('[web3.js] addProject called:', { title, category, targetAmountDev, durationInDays });

  if (!title?.trim())       throw new Error('Title is required');
  if (title.length > 200)   throw new Error('Title too long (max 200 chars)');
  if (!description?.trim()) throw new Error('Description is required');
  if (description.length > 1000) throw new Error('Description too long (max 1000 chars)');
  if (!category?.trim())    throw new Error('Category is required');
  if (!targetAmountDev || parseFloat(targetAmountDev) <= 0) throw new Error('Target amount must be greater than 0');
  if (!durationInDays || durationInDays < 1 || durationInDays > 90) throw new Error('Duration must be 1–90 days');
  if (!signer) throw new Error('Wallet not connected. Please connect your wallet first.');

  try {
    const contract = getContract(signer);
    const targetWei = ethers.parseEther(String(targetAmountDev));

    const tx = await contract.addProject(
      title.trim(), description.trim(), category.trim(), targetWei, durationInDays,
      { gasLimit: 3000000 }
    );
    console.log('[web3.js] addProject tx sent:', tx.hash);

    const { receipt, pending, txHash } = await waitForTx(tx, {
      message: 'Project submitted! It may take a moment to appear.',
    });

    if (pending) return { success: true, pending: true, txHash, projectId: null };

    // Parse ProjectCreated event for the new project ID
    let projectId = null;
    for (const log of (receipt.logs ?? [])) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === 'ProjectCreated') {
          projectId = Number(parsed.args[0]);
          break;
        }
      } catch (_) { /* skip unparsable logs */ }
    }

    console.log('[web3.js] addProject SUCCESS — projectId:', projectId, 'tx:', receipt.hash);
    return { success: true, pending: false, txHash: receipt.hash, projectId };
  } catch (error) {
    console.error('[web3.js] addProject error:', error);
    classifyError(error, 'launch project');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// contributeToProject
// ─────────────────────────────────────────────────────────────────────────────
export async function contributeToProject(projectId, amountDev, signer) {
  console.log('[web3.js] contributeToProject:', { projectId, amountDev });
  if (!signer) throw new Error('Wallet not connected');
  if (!amountDev || parseFloat(amountDev) <= 0) throw new Error('Contribution amount must be > 0 DEV');

  try {
    const contract = getContract(signer);
    const value = ethers.parseEther(String(amountDev));

    const tx = await contract.contribute(projectId, { value, gasLimit: 200000 });
    console.log('[web3.js] contribute tx sent:', tx.hash);

    const { receipt, pending, txHash } = await waitForTx(tx, {
      message: 'Contribution sent! It will appear after the next block.',
    });

    if (pending) return { success: true, pending: true, txHash };

    console.log('[web3.js] contribute confirmed:', receipt.hash);
    return { success: true, pending: false, txHash: receipt.hash };
  } catch (error) {
    console.error('[web3.js] contributeToProject error:', error);
    classifyError(error, 'contribute');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// withdrawFunds
// ─────────────────────────────────────────────────────────────────────────────
export async function withdrawFunds(projectId, signer) {
  console.log('[web3.js] withdrawFunds:', projectId);
  if (!signer) throw new Error('Wallet not connected');

  try {
    const contract = getContract(signer);
    const tx = await contract.withdrawFunds(projectId, { gasLimit: 200000 });
    console.log('[web3.js] withdrawFunds tx sent:', tx.hash);

    const { receipt, pending, txHash } = await waitForTx(tx, {
      message: 'Withdrawal sent! Funds will arrive shortly.',
    });

    if (pending) return { success: true, pending: true, txHash };
    console.log('[web3.js] withdrawFunds confirmed:', receipt.hash);
    return { success: true, pending: false, txHash: receipt.hash };
  } catch (error) {
    console.error('[web3.js] withdrawFunds error:', error);
    classifyError(error, 'withdraw funds');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// claimRefund
// ─────────────────────────────────────────────────────────────────────────────
export async function claimRefund(projectId, signer) {
  console.log('[web3.js] claimRefund:', projectId);
  if (!signer) throw new Error('Wallet not connected');

  try {
    const contract = getContract(signer);
    const tx = await contract.claimRefund(projectId, { gasLimit: 200000 });
    console.log('[web3.js] claimRefund tx sent:', tx.hash);

    const { receipt, pending, txHash } = await waitForTx(tx, {
      message: 'Refund sent! It will arrive shortly.',
    });

    if (pending) return { success: true, pending: true, txHash };
    console.log('[web3.js] claimRefund confirmed:', receipt.hash);
    return { success: true, pending: false, txHash: receipt.hash };
  } catch (error) {
    console.error('[web3.js] claimRefund error:', error);
    classifyError(error, 'claim refund');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchAllProjects
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAllProjects() {
  console.log('[web3.js] fetchAllProjects — contract:', CONTRACT_ADDRESS);

  let lastError;
  for (const rpcUrl of RPC_URLS) {
    try {
      const contract = createReadOnlyContract(rpcUrl);
      const result = await contract.getAllProjects();

      const [
        ids, creators, titles, descriptions, categories,
        targetAmounts, raisedAmounts, timestamps, deadlines, withdrawnFlags
      ] = result;

      if (!ids || ids.length === 0) {
        console.log('[web3.js] No projects found — empty array.');
        return [];
      }

      console.log('[web3.js] Fetched', ids.length, 'projects via', rpcUrl);

      return ids.map((id, i) => {
        const targetWei  = targetAmounts[i];
        const raisedWei  = raisedAmounts[i];
        const targetDev  = parseFloat(ethers.formatEther(targetWei));
        const raisedDev  = parseFloat(ethers.formatEther(raisedWei));

        return {
          id:           Number(id),
          creator:      creators[i],
          title:        titles[i],
          description:  descriptions[i],
          category:     categories[i] || 'Tech',
          targetAmount: targetDev,   // in DEV, float
          raisedAmount: raisedDev,   // in DEV, float
          targetWei:    targetWei,   // keep raw BigInt for contract calls
          raisedWei:    raisedWei,
          timestamp:    Number(timestamps[i]) * 1000, // ms
          deadline:     Number(deadlines[i])  * 1000, // ms
          withdrawn:    withdrawnFlags[i],
        };
      });
    } catch (err) {
      console.warn('[web3.js] RPC failed:', rpcUrl, '—', err.message);
      lastError = err;
    }
  }

  const msg = lastError?.message?.toLowerCase() ?? '';
  if (msg.includes('bad address') || msg.includes('invalid address') || msg.includes('could not decode')) {
    throw new Error(`Invalid contract address (${CONTRACT_ADDRESS}). Verify on moonbase.moonscan.io`);
  }
  if (msg.includes('failed to fetch') || msg.includes('fetch failed') || msg.includes('etimedout')) {
    throw new Error('Could not reach Moonbase Alpha. Check your internet connection.');
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// getContribution — reads how much a specific address contributed to a project
// ─────────────────────────────────────────────────────────────────────────────
export async function getContribution(projectId, address) {
  for (const rpcUrl of RPC_URLS) {
    try {
      const contract = createReadOnlyContract(rpcUrl);
      const wei = await contract.contributions(projectId, address);
      return parseFloat(ethers.formatEther(wei)); // DEV float
    } catch (err) {
      console.warn('[web3.js] getContribution RPC failed:', rpcUrl, '—', err.message);
    }
  }
  return 0;
}

export async function getProjectCount() {
  try {
    const count = await getReadOnlyContract().getProjectCount();
    return Number(count);
  } catch (error) {
    console.error('[web3.js] getProjectCount error:', error);
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format a DEV float for display: "1.23 DEV" */
export function formatDEV(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 DEV';
  if (amount === 0) return '0 DEV';
  if (amount < 0.001) return '< 0.001 DEV';
  return `${amount.toFixed(3).replace(/\.?0+$/, '')} DEV`;
}

export function formatRelativeTime(timestamp) {
  const now  = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (days    > 0) return `${days}d ago`;
  if (hours   > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
