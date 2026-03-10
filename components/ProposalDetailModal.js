'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatVoteCount, truncateAddress, checkVoted } from '../utils/web3';
import { useWeb3 } from '../context/Web3Context';
import { CATEGORY_STYLES, CATEGORY_DOT, deadlineInfo } from './ProposalCard';

/* ─── Inline SVG Icons ───────────────────────────────────────────────────── */
const IconVotes = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconClock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

/* ─── Glassmorphism Stat Card ────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent = false }) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col gap-2 rounded-2xl p-4 border border-white/10 backdrop-blur-md"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p
        className={`text-lg font-extrabold leading-tight truncate ${accent ? 'text-pink-400' : 'text-white'}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Glowing Progress Bar ───────────────────────────────────────────────── */
function GlowProgressBar({ voteCount, maxVotes = 1000 }) {
  const pct = Math.min((voteCount / maxVotes) * 100, 100);
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #E6007A, #a855f7)',
          boxShadow: '0 0 10px rgba(230,0,122,0.6), 0 0 20px rgba(168,85,247,0.3)',
        }}
      />
    </div>
  );
}

/* ─── Inline Toast ───────────────────────────────────────────────────────── */
function Toast({ message, type = 'info', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colours = {
    info:    'bg-slate-700 border-slate-600 text-slate-200',
    success: 'bg-emerald-900/80 border-emerald-600/60 text-emerald-200',
    warning: 'bg-amber-900/80  border-amber-500/50  text-amber-200',
    error:   'bg-red-900/80    border-red-600/50    text-red-200',
  };

  return (
    <div
      className={`
        absolute bottom-20 left-1/2 -translate-x-1/2
        flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
        shadow-xl backdrop-blur-sm animate-fade-in z-10 whitespace-nowrap
        ${colours[type] ?? colours.info}
      `}
    >
      {message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-xs">✕</button>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
export default function ProposalDetailModal({
  proposal, onClose, onVote, hasVoted: hasVotedProp, isVoting,
}) {
  const { account, isConnected } = useWeb3();

  // ── Local vote state ──────────────────────────────────────────────────────
  // Seeds from parent prop; re-verified on-open via checkVoted.
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(hasVotedProp ?? false);
  const [isCheckingVote, setIsCheckingVote] = useState(false); // on-open background check
  const [isVerifying, setIsVerifying]         = useState(false); // in-flight pre-guard check

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  // ── On-open vote check ────────────────────────────────────────────────────
  // Runs whenever this modal mounts (i.e. a proposal is selected) and the
  // wallet is connected. This catches cases where the prop is stale.
  useEffect(() => {
    if (!proposal?.id || !isConnected || !account) {
      // No wallet — just trust the prop
      setHasAlreadyVoted(hasVotedProp ?? false);
      return;
    }

    let cancelled = false;
    setIsCheckingVote(true);

    checkVoted(proposal.id, account)
      .then((voted) => {
        if (!cancelled) setHasAlreadyVoted(voted);
      })
      .catch((err) => {
        // Non-fatal: fall back to the prop value
        console.warn('[ProposalDetailModal] checkVoted failed (non-fatal):', err.message);
        if (!cancelled) setHasAlreadyVoted(hasVotedProp ?? false);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingVote(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.id, account, isConnected]);

  // ── Sync prop changes (e.g. parent optimistic update) ────────────────────
  useEffect(() => {
    if (hasVotedProp) setHasAlreadyVoted(true);
  }, [hasVotedProp]);

  // ── Vote handler (wraps parent's onVote) ──────────────────────────────────
  // NOTE: index.js's handleVote never re-throws (to avoid crashing ProposalCard's
  // fire-and-forget call). So we can't rely on catching an error here.
  // Instead, we check the on-chain state after the call to determine outcome.
  const handleVote = useCallback(async () => {
    if (!onVote || hasAlreadyVoted || isVoting || isVerifying) return;

    // Pre-guard: double-check on-chain BEFORE opening MetaMask (catches stale props)
    if (isConnected && account) {
      setIsVerifying(true);
      let alreadyOnChain = false;
      try {
        alreadyOnChain = await checkVoted(proposal.id, account);
      } catch (err) {
        console.warn('[ProposalDetailModal] pre-guard checkVoted failed, proceeding:', err.message);
      } finally {
        setIsVerifying(false);
      }
      if (alreadyOnChain) {
        setHasAlreadyVoted(true);
        showToast('✓ You have already voted on this proposal.', 'warning');
        return;
      }
    }

    // Check passed — fire the vote (index.js owns the tx + optimistic UI update)
    await onVote(proposal.id);

    // Post-verify: read on-chain state to confirm outcome
    if (isConnected && account) {
      const votedNow = await checkVoted(proposal.id, account).catch(() => null);
      if (votedNow === true) {
        setHasAlreadyVoted(true);
      } else if (votedNow === false) {
        showToast('⚠ Vote failed. The deadline may have passed.', 'error');
      }
    } else {
      setHasAlreadyVoted(true);
    }
  }, [onVote, hasAlreadyVoted, isVoting, isVerifying, isConnected, account, proposal?.id, showToast]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!proposal) return null;

  const cat            = proposal.category || 'Tech';
  const catStyle       = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Tech;
  const dotStyle       = CATEGORY_DOT[cat]    || CATEGORY_DOT.Tech;
  const dl             = deadlineInfo(proposal.deadline);
  const formattedVotes = formatVoteCount(proposal.voteCount);
  const moonscanUrl    = `https://moonbase.moonscan.io/address/${proposal.proposer}`;
  const pct            = Math.min((proposal.voteCount / 1000) * 100, 100).toFixed(1);

  const deadlineDate = proposal.deadline
    ? new Date(proposal.deadline).toLocaleString('en-GB', {
        day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  // Consolidated disabled logic
  const isDisabled = hasAlreadyVoted || isVoting || isCheckingVote || isVerifying || dl.expired;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative bg-slate-800 rounded-2xl w-full max-w-xl shadow-2xl
          border border-slate-700/60 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catStyle}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
              {cat}
            </span>
            {dl.label && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                ${dl.expired
                  ? 'bg-slate-700/80 text-slate-400 border-slate-600'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                }`}>
                {dl.expired ? '🔒 ' : '⏱ '}{dl.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">
            {proposal.title}
          </h2>

          {/* Proposer */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Proposed by</span>
            <a
              href={moonscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300
                font-mono text-sm transition-colors underline underline-offset-2"
            >
              {truncateAddress(proposal.proposer, 6, 4)}
              <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>

          <div className="border-t border-slate-700/50" />

          {/* Full description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Description
            </p>
            <div
              className="rounded-xl px-4 py-3.5 border border-white/10 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {proposal.description}
              </p>
            </div>
          </div>

          {/* ── Glassmorphism Stats Row ── */}
          <div className="flex flex-wrap gap-3">
            <StatCard icon={<IconVotes />} label="Votes" value={formattedVotes} accent />
            <StatCard icon={<IconClock />} label="Time Left" value={dl.expired ? 'Closed' : (dl.label || '—')} />
            <StatCard icon={<IconCalendar />} label="Expiration" value={deadlineDate} />
          </div>

          {/* ── Glowing Progress Bar ── */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Vote Progress
              </p>
              <span className="text-xs font-mono font-semibold text-slate-400">{pct}%</span>
            </div>
            <GlowProgressBar voteCount={proposal.voteCount} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative px-6 py-4 border-t border-slate-700/50 flex gap-3 shrink-0">
          {/* Toast lives inside the panel so it doesn't escape the modal */}
          {toast && (
            <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
          )}

          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm
              hover:bg-slate-600 hover:text-white transition-all duration-200"
          >
            Close
          </button>

          <button
            onClick={handleVote}
            disabled={isDisabled}
            className={`
              flex-1 px-4 py-3 rounded-xl font-semibold text-sm
              flex items-center justify-center gap-2 transition-all duration-200
              ${dl.expired
                ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed border border-slate-600'
                : hasAlreadyVoted
                  ? 'bg-slate-700/80 text-slate-400 cursor-not-allowed border border-slate-600/50'
                  : isCheckingVote
                    ? 'bg-slate-700/60 text-slate-500 cursor-wait'
                    : 'text-white hover:shadow-lg hover:shadow-pink-500/30 active:scale-95'
              }
              ${isVoting ? 'opacity-70 cursor-wait' : ''}
            `}
            style={!dl.expired && !hasAlreadyVoted && !isCheckingVote && !isVerifying ? {
              background: 'linear-gradient(135deg, #E6007A, #a855f7)',
            } : undefined}
          >
            {isVoting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Voting…
              </>
            ) : isVerifying ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Verifying…
              </>
            ) : isCheckingVote ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Checking…
              </>
            ) : dl.expired ? (
              '🔒 Voting Closed'
            ) : hasAlreadyVoted ? (
              '✓ Already Voted'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                Vote Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
