'use client';

import React, { useState } from 'react';
import { formatVoteCount, formatRelativeTime, truncateAddress } from '../utils/web3';

export const CATEGORY_STYLES = {
  Tech:      'bg-blue-500/20  text-blue-300  border-blue-500/30',
  Marketing: 'bg-pink-500/20  text-pink-300  border-pink-500/30',
  Ecosystem: 'bg-green-500/20 text-green-300 border-green-500/30',
  Community: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export const CATEGORY_DOT = {
  Tech:      'bg-blue-400',
  Marketing: 'bg-pink-400',
  Ecosystem: 'bg-green-400',
  Community: 'bg-purple-400',
};

/** Returns { label, expired } from a deadline ms timestamp. */
export function deadlineInfo(deadlineMs) {
  if (!deadlineMs) return { label: '', expired: false };
  const diff = deadlineMs - Date.now();
  if (diff <= 0) return { label: 'Voting Closed', expired: true };
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days >= 1) return { label: `${days}d ${hours}h left`, expired: false };
  if (hours >= 1) return { label: `${hours}h left`, expired: false };
  return { label: 'Closes soon', expired: false };
}

function UserAvatar({ address, size = 'w-10 h-10' }) {
  const colors = [
    'bg-pink-500','bg-purple-500','bg-blue-500','bg-cyan-500','bg-teal-500',
    'bg-green-500','bg-yellow-500','bg-orange-500','bg-red-500',
  ];
  const color = address
    ? colors[parseInt(address.slice(2, 4), 16) % colors.length]
    : 'bg-slate-600';
  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center shrink-0`}>
      <span className="text-white text-sm font-bold">
        {address ? address.slice(2, 4).toUpperCase() : '??'}
      </span>
    </div>
  );
}

function VoteProgressBar({ voteCount, maxVotes = 1000 }) {
  const pct = Math.min((voteCount / maxVotes) * 100, 100);
  return (
    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ProposalCard({ proposal, onVote, onCardClick, hasVoted, isVoting }) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedVotes = formatVoteCount(proposal.voteCount);
  const relativeTime   = formatRelativeTime(proposal.timestamp);
  const shortAddress   = truncateAddress(proposal.proposer, 4, 4);
  const cat            = proposal.category || 'Tech';
  const catStyle       = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Tech;
  const dotStyle       = CATEGORY_DOT[cat]    || CATEGORY_DOT.Tech;
  const dl             = deadlineInfo(proposal.deadline);
  const isDisabled     = hasVoted || isVoting || dl.expired;

  const truncatedDesc = proposal.description.length > 100
    ? proposal.description.slice(0, 100) + '…'
    : proposal.description;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View details for: ${proposal.title}`}
      onClick={() => onCardClick && onCardClick(proposal)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick(proposal)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex flex-col bg-slate-800 rounded-2xl border border-slate-700/50
        transition-all duration-300 cursor-pointer select-none
        ${isHovered
          ? 'shadow-2xl shadow-pink-500/10 border-pink-500/30 -translate-y-1 scale-[1.01]'
          : 'shadow-lg'
        }
      `}
    >
      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header: avatar + meta + deadline badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar address={proposal.proposer} />
            <div className="min-w-0">
              <p className="text-white font-medium truncate text-sm">@{shortAddress}</p>
              <p className="text-slate-400 text-xs">{relativeTime}</p>
            </div>
          </div>

          {dl.label && (
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border
              ${dl.expired
                ? 'bg-slate-700 text-slate-400 border-slate-600'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
              {dl.expired ? '🔒 ' : '⏱ '}{dl.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug">
          {proposal.title}
        </h3>

        {/* Category badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${catStyle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
            {cat}
          </span>
        </div>

        {/* Description — fills remaining space */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
          {truncatedDesc}
        </p>
      </div>

      {/* ── Card Footer (always at bottom) ── */}
      <div className="px-5 pb-5 pt-1 space-y-3 mt-auto">
        {/* Vote progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <VoteProgressBar voteCount={proposal.voteCount} />
          </div>
          <span className={`text-xs font-bold ${hasVoted ? 'text-pink-400' : 'text-pink-500'}`}>
            {formattedVotes} votes
          </span>
        </div>

        {/* Vote button — stops propagation so card click doesn't fire too */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled && onVote) onVote(proposal.id);
          }}
          disabled={isDisabled}
          className={`
            w-full py-2.5 px-4 rounded-xl font-semibold text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${dl.expired
              ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed border border-slate-600'
              : hasVoted
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-md hover:shadow-pink-500/30 active:scale-95'
            }
            ${isVoting ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {isVoting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              VOTING…
            </>
          ) : dl.expired ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              VOTING CLOSED
            </>
          ) : hasVoted ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              VOTED
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
              VOTE NOW
            </>
          )}
        </button>
      </div>
    </article>
  );
}
