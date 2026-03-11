/**
 * PolkaFund Web3 Contract Utilities
 * Uses ethers.js v6 for blockchain interactions
 */

import { ethers } from 'ethers';

export const POLKAFUND_ABI = [
  {
    "type": "function",
    "name": "addProject",
    "inputs": [
      {
        "name": "_title",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_category",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_targetAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_durationInDays",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRefund",
    "inputs": [
      {
        "name": "_projectId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "contribute",
    "inputs": [
      {
        "name": "_projectId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "contributions",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllProjects",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct PolkaFund.Project[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address payable"
          },
          {
            "name": "title",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "description",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "category",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "targetAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "currentAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProject",
    "inputs": [
      {
        "name": "_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct PolkaFund.Project",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address payable"
          },
          {
            "name": "title",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "description",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "category",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "targetAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "currentAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProjectCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdrawFunds",
    "inputs": [
      {
        "name": "_projectId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ContributionMade",
    "inputs": [
      {
        "name": "projectId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "backer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newCurrentAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FundsWithdrawn",
    "inputs": [
      {
        "name": "projectId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProjectCreated",
    "inputs": [
      {
        "name": "projectId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "title",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "targetAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "deadline",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RefundClaimed",
    "inputs": [
      {
        "name": "projectId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "backer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

const RAW_ADDRESS = "0x294F5b9d6cE8dA899452b9F8F72b4cdAF7e4Ac9A";
export let CONTRACT_ADDRESS;

try {
  CONTRACT_ADDRESS = ethers.getAddress(RAW_ADDRESS.trim());
  console.log("Validated Address:", CONTRACT_ADDRESS);
} catch (e) {
  console.error("CRITICAL: The address provided is NOT a valid Ethereum address!");
  CONTRACT_ADDRESS = RAW_ADDRESS.trim();
}

// Moonbase Alpha RPC endpoints
const RPC_URLS = [
  "https://rpc.api.moonbase.moonbeam.network",
  "https://moonbeam-alpha.api.onfinality.io/public",
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

  if (!title?.trim()) throw new Error('Title is required');
  if (title.length > 200) throw new Error('Title too long (max 200 chars)');
  if (!description?.trim()) throw new Error('Description is required');
  if (description.length > 1000) throw new Error('Description too long (max 1000 chars)');
  if (!category?.trim()) throw new Error('Category is required');
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

      if (!result || result.length === 0) {
        console.log('[web3.js] No projects found — empty array.');
        return [];
      }

      console.log('[web3.js] Fetched', result.length, 'projects via', rpcUrl);

      return result.map((p) => {
        const targetWei = p.targetAmount;
        const raisedWei = p.currentAmount;
        const targetDev = parseFloat(ethers.formatEther(targetWei));
        const raisedDev = parseFloat(ethers.formatEther(raisedWei));

        return {
          id: Number(p.id),
          creator: p.creator,
          title: p.title,
          description: p.description,
          category: p.category || 'Tech',
          targetAmount: targetDev,   // in DEV, float
          raisedAmount: raisedDev,   // in DEV, float
          targetWei: targetWei,   // keep raw BigInt for contract calls
          raisedWei: raisedWei,
          timestamp: Number(p.id), // fallback timestamp mapping for sorting
          deadline: Number(p.deadline) * 1000, // ms
          withdrawn: !p.active,
        };
      });
    } catch (err) {
      console.warn('[web3.js] RPC failed:', rpcUrl, '—', err.message);
      lastError = err;
    }
  }

  const msg = lastError?.message?.toLowerCase() ?? '';
  console.error("Fetch Error:", lastError?.message);

  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error("Invalid Address Format");
  }

  if (msg.includes('bad address') || msg.includes('invalid address') || msg.includes('could not decode')) {
    // If it's a technically valid address format but fails decoding, it could be a wrong contract on the chain,
    // but the task specifically requested to ONLY show network error if the isAddress is true.
    throw new Error("RPC Connection Failed. Please check your internet or try a different RPC node.");
  }

  if (msg.includes('failed to fetch') || msg.includes('fetch failed') || msg.includes('etimedout')) {
    throw new Error("RPC Connection Failed. Please check your internet or try a different RPC node.");
  }

  throw new Error("RPC Connection Failed. Please check your internet or try a different RPC node.");
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
