import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { addProject } from '../utils/web3';
import { ethers } from 'ethers';

const CATEGORIES = ['Tech', 'Marketing', 'Ecosystem', 'Community'];
const DURATIONS  = [
  { label: '1 day',   value: 1  },
  { label: '3 days',  value: 3  },
  { label: '7 days',  value: 7  },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

export default function SubmitProposalModal({ isOpen, onClose, onSuccess }) {
  const { signer, isConnected } = useWeb3();

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState('Tech');
  const [duration, setDuration]     = useState(7);
  const [targetAmount, setTargetAmount] = useState(''); // DEV string
  const [errors, setErrors]         = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);

  const validate = () => {
    const e = {};
    if (!title?.trim() || title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    else if (title.length > 200)   e.title       = 'Title must be ≤ 200 characters';
    if (!description?.trim() || description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    else if (description.length > 1000) e.description = 'Description must be ≤ 1000 characters';
    const amt = parseFloat(targetAmount);
    if (!targetAmount || isNaN(amt) || amt <= 0)
      e.targetAmount = 'Funding goal must be greater than 0 DEV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('='.repeat(60));
    console.log('[MOD] handleSubmit triggered');
    console.log('='.repeat(60));
    
    // Step 1: Validate form fields
    if (!validate()) {
      console.warn('[MOD] Form validation failed');
      return;
    }
    
    if (!isConnected) { 
      console.warn('[MOD] Wallet not connected');
      setErrors({ form: 'Please connect your wallet first' }); 
      return; 
    }
    
    if (!signer) { 
      console.warn('[MOD] No signer available');
      setErrors({ form: 'Wallet signer not available. Please reconnect.' }); 
      return; 
    }

    try {
      // Step 2: ATOMIC SUBMISSION GUARD - Set loading state
      console.log('[MOD] Setting loading state...');
      setIsCheckingSafety(true);
      setErrors({});
      
      // Step 3: CALL THE API
      console.log('[MOD] Analyzing content...');
      console.log('[MOD] Title:', title);
      console.log('[MOD] Description:', description);
      
      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      
      console.log('[MOD] API response status:', modRes.status);
      
      // TASK 2: Deep Debugging - Console log the full response data
      let modData;
      try {
        if (!modRes.ok) {
           throw new Error(`HTTP Error: ${modRes.status}`);
        }
        modData = await modRes.json();
      } catch (e) {
        console.error('[MOD] API Failed or Failed to parse API response as JSON', e);
        // TASK 2: Silent Fail with Friendly Message
        modData = { safe: false, reason: 'Security service busy, please try again. (API down)' };
      }
      
      console.log('='.repeat(60));
      console.log('[MOD] Exact Data Received:', modData);
      console.log('='.repeat(60));
      
      // Step 4: Reset loading state
      setIsCheckingSafety(false);
      
      // Step 5: THE FINAL GATE (STRICT GUARD)
      console.log('[MOD] Evaluating safety check...');
      console.log('[MOD] modData.safe =', modData.safe);
      
      if (modData.safe === true) {
        // ✅ ALLOWED - Content passed
        console.log('✅ [MOD] SUCCESS - Content passed safety check');
        console.log('[MOD] Proceeding to blockchain transaction...');

        // Step 6: Safety passed - proceed with blockchain transaction
        setIsSubmitting(true);
        
        console.log('[MOD] Calling addProject()...');
        const result = await addProject(title, description, category, targetAmount, duration, signer);
        
        console.log('[MOD] Transaction completed:', result);
        
        resetForm();
        if (onSuccess) onSuccess(result);
        onClose();
        
        console.log('[MOD] Modal closed, form reset');
      } else {
        // ❌ BLOCKED - Show error in UI
        console.warn('❌ [MOD] BLOCKED - Content failed safety check');
        console.warn('[MOD] Reason:', modData.reason);
        
        // TASK 2: Show exact error in the UI
        setErrors({ 
          form: 'Safety Check Failed',
          details: modData.reason || 'Content blocked by Security Guard.'
        });
      }
    } catch (err) {
      console.error('❌ [MOD] Error in handleSubmit:', err);
      console.error('[MOD] Error name:', err.name);
      console.error('[MOD] Error message:', err.message);
      
      setErrors({ form: err.message || 'Failed to launch project. Please try again.' });
    } finally {
      console.log('[MOD] Finally block - resetting states');
      // TASK 2: State Reset
      setIsCheckingSafety(false);
      setIsSubmitting(false);
      console.log('='.repeat(60));
      console.log('[MOD] handleSubmit completed');
      console.log('='.repeat(60));
    }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('Tech');
    setDuration(7); setTargetAmount(''); setErrors({});
  };

  const handleClose = () => { resetForm(); setIsSubmitting(false); onClose(); };

  if (!isOpen) return null;

  const SELECT_CLS = `
    w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white
    focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500
    transition-all duration-200 cursor-pointer
  `;
  const INPUT_CLS = (hasErr) => `
    w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-200
    ${hasErr ? 'border-red-500' : 'border-slate-700 focus:border-pink-500'}
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with fade-in animation */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" 
        onClick={handleClose}
      />

      {/* Modal content with scale and fade animation */}
      <div className="relative bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700/50 overflow-hidden animate-modal-enter">
        <style jsx>{`
          @keyframes modal-enter {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-modal-enter {
            animation: modal-enter 0.3s ease-out forwards;
          }
        `}</style>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">Launch a Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">Raise DEV tokens from the community</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {errors.form && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm font-medium">{errors.form}</p>
              {errors.details && (
                <p className="text-red-300 text-xs mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.details}
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="proj-title" className="block text-sm font-medium text-slate-300 mb-2">
              Project Title
            </label>
            <input
              type="text" id="proj-title" value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null, form: null, details: null }));
              }}
              placeholder="Give your project a compelling title…"
              className={INPUT_CLS(!!errors.title || (title.length > 0 && title.trim().length < 3))}
              maxLength={200}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            {title.length > 0 && title.trim().length < 3 && !errors.title && (
              <p className="mt-1 text-sm text-yellow-500/80">Title must be at least 3 characters</p>
            )}
            <p className="mt-1 text-xs text-slate-500 text-right">{title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="proj-desc" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="proj-desc" value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: null, form: null, details: null }));
              }}
              placeholder="Describe your project. What will the funds be used for?"
              rows={4}
              className={`${INPUT_CLS(!!errors.description || (description.length > 0 && description.trim().length < 10))} resize-none`}
              maxLength={1000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            {description.length > 0 && description.trim().length < 10 && !errors.description && (
              <p className="mt-1 text-sm text-yellow-500/80">Description must be at least 10 characters</p>
            )}
            <p className="mt-1 text-xs text-slate-500 text-right">{description.length}/1000</p>
          </div>

          {/* Funding Goal */}
          <div>
            <label htmlFor="proj-target" className="block text-sm font-medium text-slate-300 mb-2">
              Funding Goal (DEV)
            </label>
            <div className="relative">
              <input
                type="number" id="proj-target" value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g. 10"
                min="0.001" step="0.001"
                className={`${INPUT_CLS(!!errors.targetAmount)} pr-14`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                DEV
              </span>
            </div>
            {errors.targetAmount && <p className="mt-1 text-sm text-red-400">{errors.targetAmount}</p>}
            <p className="mt-1 text-xs text-slate-500">
              Funds are only released to you if the goal is met by the deadline.
            </p>
          </div>

          {/* Category + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-cat" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select id="proj-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={SELECT_CLS}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="proj-dur" className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
              <select id="proj-dur" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={SELECT_CLS}>
                {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={isSubmitting || isCheckingSafety}
              className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium
                hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isCheckingSafety || !isConnected}
              className={`flex-1 px-4 py-3 rounded-xl font-medium
                bg-gradient-to-r from-pink-500 to-pink-600 text-white
                hover:from-pink-600 hover:to-pink-700 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!isSubmitting && !isCheckingSafety && isConnected ? 'hover:shadow-lg hover:shadow-pink-500/30' : ''}`}>
              {isCheckingSafety ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking safety...
                </span>
              ) : isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Launching…
                </span>
              ) : '🚀 Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
