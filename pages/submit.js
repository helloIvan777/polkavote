'use client';

import React, { useState } from 'react';
import Layout from '../components/Layout';
import SubmitProposalModal from '../components/SubmitProposalModal';
import { connectWallet, submitProposal } from '../utils/web3';
import { POLKAVOTE_ADDRESS } from '../utils/web3';

/**
 * Submit Idea Page
 * Dedicated page for submitting new proposals
 */
export default function SubmitPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err) {
      console.error('Wallet connection error:', err);
      alert(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmitProposal = async (proposalData) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);
      
      const { signer } = await connectWallet();
      const result = await submitProposal(
        proposalData.title,
        proposalData.description,
        signer,
        POLKAVOTE_ADDRESS
      );

      if (result.success) {
        setSubmissionResult({
          success: true,
          message: 'Your proposal has been submitted successfully!',
          txHash: result.txHash
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Submit proposal error:', err);
      setSubmissionResult({
        success: false,
        message: 'Failed to submit proposal. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">Submit Your Idea</h1>
          <p className="text-slate-400">
            Share your vision for the future of Polkadot with the community
          </p>
        </div>

        {/* Connect Wallet Card */}
        {!walletAddress ? (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-6">
              You need to connect your MetaMask wallet to submit a proposal
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
                hover:from-pink-600 hover:to-pink-700 transition-all duration-200
                hover:shadow-lg hover:shadow-pink-500/30
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        ) : (
          <>
            {/* Success Message */}
            {submissionResult && (
              <div className={`mb-6 p-4 rounded-xl border ${
                submissionResult.success 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <p>{submissionResult.message}</p>
                {submissionResult.txHash && (
                  <p className="text-sm mt-2">
                    TX: {submissionResult.txHash.slice(0, 10)}...{submissionResult.txHash.slice(-8)}
                  </p>
                )}
              </div>
            )}

            {/* Submit Card */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create New Proposal</h2>
                  <p className="text-sm text-slate-400">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
                  hover:from-pink-600 hover:to-pink-700 transition-all duration-200
                  hover:shadow-lg hover:shadow-pink-500/30"
              >
                Start Writing Your Proposal
              </button>

              <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-2">Guidelines</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Be clear and concise in your title</li>
                  <li>• Provide detailed description of your idea</li>
                  <li>• Explain how it benefits the Polkadot ecosystem</li>
                  <li>• Maximum 200 characters for title, 1000 for description</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit Proposal Modal */}
      <SubmitProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProposal}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
