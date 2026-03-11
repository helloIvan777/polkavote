# 🚀 PolkaFund: AI-Powered Crowdfunding

> "A next-generation decentralized crowdfunding platform built on Moonbeam (Moonbase Alpha) with Gemini AI moderation."

## 🌟 Core Value Propositions

*   🛡️ **AI Iron Shield**: Google Gemini 1.5 Flash analyzes projects before they hit the blockchain, effectively preventing scams and ensuring only high-quality proposals are launched.
*   🧪 **Professional Testing**: Built with 100% Foundry test coverage and robust Fuzz testing for resilient, secure smart contracts.
*   📱 **Seamless UX**: Features a built-in "Connect Wallet" flow directly inside modals alongside dynamic, frictionless category filtering.

## 🛠️ Tech Stack

*   **Smart Contracts**: Solidity 0.8.20
*   **Frontend**: Next.js 14, Tailwind CSS, Ethers.js
*   **AI**: Google Gemini API
*   **Environment**: Moonbase Alpha (ChainID 1287)

## 📦 Installation & Usage

### Smart Contracts (Foundry)
To build and test the smart contracts:
```bash
forge build
forge test
```

### Frontend
To install dependencies and run the development server:
```bash
npm install
npm run dev
```

⚠️ **Requirement**: You must create a `.env.local` file in the root directory and add your `GEMINI_API_KEY` for the AI moderation features to function correctly.

## 📊 Project Metadata

*   **Contract Address**: `0x338146CD7a2a38ff23e256F65F6E459302E2666A`
*   **DoraHacks**: [Link to DoraHacks submission](https://dorahacks.io) *(Update with actual link)*

## 🔧 Git Troubleshooting

If you encounter the `! [rejected] (fetch first)` error when pushing, use the following commands to resolve the issue:

```bash
git pull --rebase origin main
git push origin main
```
