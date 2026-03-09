import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { addProposal } from '../utils/web3';

export default function SubmitProposalModal({ isOpen, onClose, onSuccess }) {
  const { signer, isConnected } = useWeb3();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!title || !title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (!description || !description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!isConnected) {
      setErrors({ form: 'Please connect your wallet first' });
      return;
    }

    if (!signer) {
      setErrors({ form: 'Wallet signer not available. Please reconnect.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      console.log('[SubmitProposalModal] Submitting proposal...');
      console.log('[SubmitProposalModal] Title:', title);
      console.log('[SubmitProposalModal] Description:', description);
      console.log('[SubmitProposalModal] Has signer:', !!signer);

      const result = await addProposal(title, description, signer);

      console.log('[SubmitProposalModal] Proposal submitted successfully:', result);

      setTitle('');
      setDescription('');

      if (onSuccess) {
        onSuccess(result);
      }

      onClose();
    } catch (error) {
      console.error('[SubmitProposalModal] Submission failed:', error);

      let errorMessage = 'Failed to submit proposal. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Submit Your Idea</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.form && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{errors.form}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your idea a catchy title..."
              className={`
                w-full px-4 py-3 bg-slate-900 border rounded-xl text-white
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50
                transition-all duration-200
                ${errors.title ? 'border-red-500' : 'border-slate-700 focus:border-pink-500'}
              `}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-slate-500 text-right">
              {title.length}/200
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail. What problem does it solve? How will it benefit the Polkadot ecosystem?"
              rows={5}
              className={`
                w-full px-4 py-3 bg-slate-900 border rounded-xl text-white
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50
                transition-all duration-200 resize-none
                ${errors.description ? 'border-red-500' : 'border-slate-700 focus:border-pink-500'}
              `}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-slate-500 text-right">
              {description.length}/1000
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium
                hover:bg-slate-600 transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className={`
                flex-1 px-4 py-3 rounded-xl font-medium
                bg-gradient-to-r from-pink-500 to-pink-600 text-white
                hover:from-pink-600 hover:to-pink-700
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!isSubmitting && isConnected ? 'hover:shadow-lg hover:shadow-pink-500/30' : ''}
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Proposal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
