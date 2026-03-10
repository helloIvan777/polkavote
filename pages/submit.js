'use client';

import React, { useState } from 'react';
import Layout from '../components/Layout';
import SubmitProposalModal from '../components/SubmitProposalModal';
import ConnectState, { EmptyIcon } from '../components/ConnectState';
import { useWeb3 } from '../context/Web3Context';
import { addProposal } from '../utils/web3';

/**
 * Submit Idea Page
 */
export default function SubmitPage() {
  const { account, isConnected, connectWallet, getSigner, isConnecting } = useWeb3();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleSubmitProposal = async (proposalData) => {
    console.log('[SubmitPage] handleSubmitProposal called');
    
    if (!isConnected) {
      console.log('[SubmitPage] Not connected, attempting to connect...');
      await connectWallet();
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);
      
      const signer = await getSigner();
      console.log('[SubmitPage] Got signer:', !!signer);
      
      if (!signer) {
        throw new Error('No signer available. Please connect your wallet.');
      }
      
      console.log('[SubmitPage] Calling addProposal...');
      const result = await addProposal(
        proposalData.title,
        proposalData.description,
        signer
      );
      
      console.log('[SubmitPage] addProposal result:', result);

      if (result.success) {
        setSubmissionResult({
          success: true,
          message: 'Your proposal has been submitted successfully!',
          txHash: result.txHash
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('[SubmitPage] Submit proposal error:', err);
      setSubmissionResult({
        success: false,
        message: `Failed to submit proposal: ${err.message || 'Unknown error'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header - Centered Standardized */}
        <div className="pt-10 mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#e6007a] mb-4">
            Submit Your Idea
          </h1>
          <p className="text-lg text-gray-400 mb-12">
            Share your vision for the future of Polkadot with the community
          </p>
        </div>

        {/* Connect Wallet State */}
        {!isConnected ? (
          <ConnectState
            title="Connect Your Wallet"
            description="You need to connect your wallet to submit a proposal"
            icon={<EmptyIcon />}
            onConnect={connectWallet}
            isConnecting={isConnecting}
          />
        ) : (
          <>
            {/* Result Message */}
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
                  <p className="text-sm text-slate-400">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
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
