'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatDEV, truncateAddress, getContribution } from '../utils/web3';
import { useWeb3 } from '../context/Web3Context';
import { CATEGORY_STYLES, CATEGORY_DOT, deadlineInfo } from './ProposalCard';

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IconFund  = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconClock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconTarget = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
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

/* ─── Glowing Funding Progress Bar ──────────────────────────────────────── */
function GlowProgressBar({ raisedAmount, targetAmount }) {
  const pct = targetAmount > 0 ? Math.min((raisedAmount / targetAmount) * 100, 100) : 0;
  const isSuccess = pct >= 100;
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: isSuccess
            ? 'linear-gradient(90deg, #10b981, #34d399)'
            : 'linear-gradient(90deg, #E6007A, #a855f7)',
          boxShadow: isSuccess
            ? '0 0 10px rgba(16,185,129,0.6)'
            : '0 0 10px rgba(230,0,122,0.6), 0 0 20px rgba(168,85,247,0.3)',
        }}
      />
    </div>
  );
}

/* ─── Inline Toast ───────────────────────────────────────────────────────── */
function Toast({ message, type = 'info', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colours = {
    info:    'bg-slate-700   border-slate-600  text-slate-200',
    success: 'bg-emerald-900/80 border-emerald-600/60 text-emerald-200',
    warning: 'bg-amber-900/80  border-amber-500/50  text-amber-200',
    error:   'bg-red-900/80    border-red-600/50    text-red-200',
  };

  return (
    <div className={`
      absolute bottom-20 left-1/2 -translate-x-1/2
      flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
      shadow-xl backdrop-blur-sm animate-fade-in z-10 whitespace-nowrap
      ${colours[type] ?? colours.info}
    `}>
      {message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-xs">✕</button>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
export default function ProposalDetailModal({
  proposal, onClose, onContribute, onWithdraw, onRefund, isActing,
}) {
  const { account, isConnected, getSigner } = useWeb3();

  const [contributionAmount, setContributionAmount] = useState('');
  const [userContribution, setUserContribution]     = useState(0);   // DEV, float
  const [isLoadingContrib, setIsLoadingContrib]     = useState(false);
  const [toast, setToast] = useState(null);

  const showToast  = useCallback((message, type = 'info') => setToast({ message, type }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  // Load the connected user's existing contribution for this project
  useEffect(() => {
    if (!proposal?.id || !account) { setUserContribution(0); return; }

    let cancelled = false;
    setIsLoadingContrib(true);
    getContribution(proposal.id, account)
      .then((amt) => { if (!cancelled) setUserContribution(amt); })
      .catch(() => { if (!cancelled) setUserContribution(0); })
      .finally(() => { if (!cancelled) setIsLoadingContrib(false); });

    return () => { cancelled = true; };
  }, [proposal?.id, account]);

  if (!proposal) return null;

  const cat        = proposal.category || 'Tech';
  const catStyle   = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Tech;
  const dotStyle   = CATEGORY_DOT[cat]    || CATEGORY_DOT.Tech;
  const dl         = deadlineInfo(proposal.deadline, proposal.raisedAmount, proposal.targetAmount);
  const isExpired  = dl.status === 'success' || dl.status === 'failed';
  const pct        = proposal.targetAmount > 0
    ? Math.min((proposal.raisedAmount / proposal.targetAmount) * 100, 100).toFixed(1)
    : '0.0';

  const moonscanUrl = `https://moonbase.moonscan.io/address/${proposal.creator}`;

  const deadlineDate = proposal.deadline
    ? new Date(proposal.deadline).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '—';

  // ── Button visibility logic ──────────────────────────────────────────────
  const isCreator = account && proposal.creator &&
    account.toLowerCase() === proposal.creator.toLowerCase();

  const canContribute  = !isExpired && isConnected;
  const canWithdraw    = isExpired && isCreator &&
    proposal.raisedAmount >= proposal.targetAmount && !proposal.withdrawn;
  const canRefund      = isExpired && !isCreator &&
    proposal.raisedAmount < proposal.targetAmount && userContribution > 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleContribute = async () => {
    const amt = parseFloat(contributionAmount);
    if (!contributionAmount || isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid DEV amount.', 'warning');
      return;
    }
    if (!isConnected) {
      showToast('Please connect your wallet first.', 'warning');
      return;
    }
    try {
      await onContribute(proposal.id, contributionAmount);
      setContributionAmount('');
    } catch (err) {
      showToast(err.message || 'Contribution failed.', 'error');
    }
  };

  const handleWithdraw = async () => {
    try {
      await onWithdraw(proposal.id);
    } catch (err) {
      showToast(err.message || 'Withdrawal failed.', 'error');
    }
  };

  const handleRefund = async () => {
    try {
      await onRefund(proposal.id);
    } catch (err) {
      showToast(err.message || 'Refund claim failed.', 'error');
    }
  };

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
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                dl.status === 'success' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                dl.status === 'failed'  ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                'bg-amber-500/10 text-amber-300 border-amber-500/25'
              }`}>
                {dl.label}
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

          {/* Creator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Created by</span>
            <a
              href={moonscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300
                font-mono text-sm transition-colors underline underline-offset-2"
            >
              {truncateAddress(proposal.creator, 6, 4)}
              <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
            {isCreator && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5
                rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                You
              </span>
            )}
          </div>

          <div className="border-t border-slate-700/50" />

          {/* Description */}
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

          {/* ── Stats Row ── */}
          <div className="flex flex-wrap gap-3">
            <StatCard icon={<IconFund />}   label="Raised"    value={formatDEV(proposal.raisedAmount)} accent />
            <StatCard icon={<IconTarget />} label="Goal"      value={formatDEV(proposal.targetAmount)} />
            <StatCard icon={<IconClock />}  label="Time Left" value={isExpired ? (dl.status === 'success' ? 'Funded!' : 'Expired') : (dl.label || '—')} />
          </div>

          {/* ── Funding Progress Bar ── */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Funding Progress
              </p>
              <span className="text-xs font-mono font-semibold text-slate-400">{pct}%</span>
            </div>
            <GlowProgressBar raisedAmount={proposal.raisedAmount} targetAmount={proposal.targetAmount} />
            <p className="text-xs text-slate-500 text-right">
              Deadline: {deadlineDate}
            </p>
          </div>

          {/* User's existing contribution */}
          {isConnected && !isCreator && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Your contribution:</span>
              {isLoadingContrib ? (
                <span className="text-slate-400 flex items-center gap-1"><Spinner /> Loading…</span>
              ) : (
                <span className={`font-semibold ${userContribution > 0 ? 'text-pink-400' : 'text-slate-400'}`}>
                  {userContribution > 0 ? formatDEV(userContribution) : 'None yet'}
                </span>
              )}
            </div>
          )}

          {/* ── Contribution Input (only if campaign is active) ── */}
          {canContribute && (
            <div className="rounded-xl border border-white/10 p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Back this project
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    placeholder="0.00"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full pl-4 pr-14 py-2.5 bg-slate-900 border border-slate-700
                      rounded-xl text-white placeholder-slate-600
                      focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500
                      transition-all duration-200 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    DEV
                  </span>
                </div>
                <div className="flex gap-1">
                  {['0.01', '0.1', '1'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setContributionAmount(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300
                        hover:bg-slate-600 text-xs font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="relative px-6 py-4 border-t border-slate-700/50 flex gap-3 shrink-0">
          {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm
              hover:bg-slate-600 hover:text-white transition-all duration-200"
          >
            Close
          </button>

          {/* Back this Project */}
          {canContribute && (
            <button
              onClick={handleContribute}
              disabled={isActing}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm
                flex items-center justify-center gap-2 transition-all duration-200
                text-white hover:shadow-lg hover:shadow-pink-500/30 active:scale-95
                disabled:opacity-60 disabled:cursor-wait"
              style={{ background: 'linear-gradient(135deg, #E6007A, #a855f7)' }}
            >
              {isActing ? <><Spinner /> Processing…</> : '💜 Back this Project'}
            </button>
          )}

          {/* Withdraw Funds (creator, goal met, deadline passed) */}
          {canWithdraw && (
            <button
              onClick={handleWithdraw}
              disabled={isActing}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm
                flex items-center justify-center gap-2 transition-all duration-200
                bg-emerald-600 hover:bg-emerald-500 text-white
                hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95
                disabled:opacity-60 disabled:cursor-wait"
            >
              {isActing ? <><Spinner /> Processing…</> : '🏦 Withdraw Funds'}
            </button>
          )}

          {/* Claim Refund (backer, goal not met, deadline passed) */}
          {canRefund && (
            <button
              onClick={handleRefund}
              disabled={isActing}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm
                flex items-center justify-center gap-2 transition-all duration-200
                bg-amber-600 hover:bg-amber-500 text-white
                hover:shadow-lg hover:shadow-amber-500/30 active:scale-95
                disabled:opacity-60 disabled:cursor-wait"
            >
              {isActing ? <><Spinner /> Processing…</> : '↩ Claim Refund'}
            </button>
          )}

          {/* Expired, no action available */}
          {isExpired && !canWithdraw && !canRefund && (
            <button disabled className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm
              bg-slate-700/60 text-slate-500 cursor-not-allowed border border-slate-600">
              {dl.status === 'success' ? '🎉 Campaign Successful' : '✕ Campaign Ended'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
