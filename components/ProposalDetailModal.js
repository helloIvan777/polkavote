import React from 'react';
import { formatVoteCount, truncateAddress } from '../utils/web3';
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
      className="flex-1 flex flex-col gap-2 rounded-2xl p-4 border border-white/10 backdrop-blur-md"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-xl font-extrabold leading-tight ${accent ? 'text-pink-400' : 'text-white'}`}>
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

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
export default function ProposalDetailModal({
  proposal, onClose, onVote, hasVoted, isVoting,
}) {
  if (!proposal) return null;

  const cat            = proposal.category || 'Tech';
  const catStyle       = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Tech;
  const dotStyle       = CATEGORY_DOT[cat]    || CATEGORY_DOT.Tech;
  const dl             = deadlineInfo(proposal.deadline);
  const isDisabled     = hasVoted || isVoting || dl.expired;
  const formattedVotes = formatVoteCount(proposal.voteCount);
  const moonscanUrl    = `https://moonbase.moonscan.io/address/${proposal.proposer}`;
  const pct            = Math.min((proposal.voteCount / 1000) * 100, 100).toFixed(1);

  const deadlineDate = proposal.deadline
    ? new Date(proposal.deadline).toLocaleString('en-GB', {
        day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          <div className="flex gap-4">
            <StatCard
              icon={<IconVotes />}
              label="Votes"
              value={formattedVotes}
              accent
            />
            <StatCard
              icon={<IconClock />}
              label="Time Left"
              value={dl.expired ? 'Closed' : (dl.label || '—')}
            />
            <StatCard
              icon={<IconCalendar />}
              label="Expiration"
              value={deadlineDate}
            />
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
        <div className="px-6 py-4 border-t border-slate-700/50 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm
              hover:bg-slate-600 hover:text-white transition-all duration-200"
          >
            Close
          </button>

          <button
            onClick={() => !isDisabled && onVote && onVote(proposal.id)}
            disabled={isDisabled}
            className={`
              flex-1 px-4 py-3 rounded-xl font-semibold text-sm
              flex items-center justify-center gap-2 transition-all duration-200
              ${dl.expired
                ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed border border-slate-600'
                : hasVoted
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'text-white hover:shadow-lg hover:shadow-pink-500/30 active:scale-95'
              }
              ${isVoting ? 'opacity-70 cursor-wait' : ''}
            `}
            style={!dl.expired && !hasVoted ? {
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
            ) : dl.expired ? (
              '🔒 Voting Closed'
            ) : hasVoted ? (
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
