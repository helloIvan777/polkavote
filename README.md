# PolkaVote 🗳️

A decentralized idea board for the Polkadot ecosystem. Users can connect their MetaMask wallet, submit proposals, and vote on ideas to shape the future of Polkadot.

![PolkaVote](https://img.shields.io/badge/Polkadot-Web3-E6007A?style=for-the-badge&logo=polkadot)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-blue?style=for-the-badge&logo=ethereum)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

- **Connect MetaMask Wallet** - Secure Web3 authentication
- **Submit Proposals** - Share your ideas with the community
- **Vote on Ideas** - One vote per address per proposal
- **Real-time Stats** - Live proposal and vote counts
- **Responsive Design** - Desktop sidebar + Mobile bottom navigation
- **Modern UI** - Clean, professional Web3 aesthetic

## 🎨 Design System

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep Blue | `#0F172A` (Slate-900) |
| Card Background | Slate | `#1E293B` (Slate-800) |
| Primary Accent | Electric Pink | `#DB2777` (Pink-500) |
| Text | White | `#F8FAFC` (Slate-50) |
| Secondary Text | Slate | `#CBD5E1` (Slate-300) |

## 📁 Project Structure

```
PolkaVote/
├── app/                    # Next.js App Router
│   ├── layout.js          # Root layout
│   └── page.js            # Main page entry
├── components/            # React components
│   ├── Layout.js          # Main layout with navigation
│   ├── ProposalCard.js    # Proposal card component
│   └── SubmitProposalModal.js
├── contracts/             # Solidity smart contracts
│   └── PolkaVote.sol      # Main voting contract
├── pages/                 # Next.js Pages
│   ├── index.js           # Home page (Idea Board)
│   ├── submit.js          # Submit proposal page
│   ├── votes.js           # My votes page
│   └── profile.js         # User profile page
├── styles/                # Global styles
│   └── globals.css        # Tailwind + custom styles
├── utils/                 # Utilities
│   └── web3.js            # Web3/ethers.js utilities
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd PolkaVote
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_POLKAVOTE_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
   ```

4. **Deploy the Smart Contract**
   
   Compile and deploy `contracts/PolkaVote.sol` to your preferred EVM-compatible network (Polygon, Ethereum, etc.)
   
   Update the contract address in:
   - `.env.local`
   - `utils/web3.js` (line 13)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main idea board with all proposals |
| Submit | `/submit` | Create new proposals |
| My Votes | `/votes` | View your voting history |
| Profile | `/profile` | User profile and stats |

## 🔧 Smart Contract Functions

### `addProposal(string _title, string _description)`
Creates a new proposal. Returns the proposal ID.

### `vote(uint256 _proposalId)`
Vote on a proposal. Each address can only vote once per proposal.

### `getAllProposals()`
Returns all proposals with their details.

### `getProposal(uint256 _proposalId)`
Returns a single proposal by ID.

### `checkVoted(uint256 _proposalId, address _voter)`
Check if an address has voted on a proposal.

### `getProposalCount()`
Returns the total number of proposals.

### `getTotalVotes()`
Returns the total votes across all proposals.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Web3**: ethers.js v6
- **Smart Contract**: Solidity ^0.8.20
- **Wallet**: MetaMask

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔐 Security Notes

- Each address can only vote **once per proposal**
- Proposal titles are limited to 200 characters
- Proposal descriptions are limited to 1000 characters
- All transactions require MetaMask confirmation

## 🌐 Network Compatibility

This dApp is designed for EVM-compatible networks:
- Polygon (recommended for low fees)
- Ethereum Mainnet
- Arbitrum
- Optimism
- Any EVM-compatible chain

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for the Polkadot Ecosystem**
