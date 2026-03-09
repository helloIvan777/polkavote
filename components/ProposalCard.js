'use client';

import React, { useState } from 'react';
import { formatVoteCount, formatRelativeTime, truncateAddress } from '../utils/web3';

const CATEGORY_STYLES = {
  Tech:      'bg-blue-500/20  text-blue-300  border-blue-500/30',
  Marketing: 'bg-pink-500/20  text-pink-300  border-pink-500/30',
  Ecosystem: 'bg-green-500/20 text-green-300 border-green-500/30',
  Community: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const CATEGORY_DOT = {
  Tech:      'bg-blue-400',
  Marketing: 'bg-pink-400',
  Ecosystem: 'bg-green-400',
  Community: 'bg-purple-400',
};

/** Returns { label: "3 days left" | "Closes today" | "Voting Closed", expired: bool } */
function deadlineInfo(deadlineMs) {
  if (!deadlineMs) return { label: '', expired: false };
  const now  = Date.now();
  const diff = deadlineMs - now;           // ms remaining
  if (diff <= 0) return { label: 'Voting Closed', expired: true };

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  if (days >= 1) return { label: `${days}d ${hours}h left`, expired: false };
  if (hours >= 1) return { label: `${hours}h left`, expired: false };
  return { label: 'Closes soon', expired: false };
}

function UserAvatar({ address, size = 'w-10 h-10' }) {
  const colors = [
    'bg-pink-500','bg-purple-500','bg-blue-500','bg-cyan-500','bg-teal-500',
    'bg-green-500','bg-yellow-500','bg-orange-500','bg-red-500',
  ];
  const color = address ? colors[parseInt(address.slice(2, 4), 16) % colors.length] : 'bg-slate-600';
  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center`}>
      <span className="text-white text-sm font-bold">
        {address ? address.slice(2, 4).toUpperCase() : '??'}
      </span>
    </div>
  );
}

function VoteProgressBar({ voteCount, maxVotes = 1000 }) {
  const pct = Math.min((voteCount / maxVotes) * 100, 100);
  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ProposalCard({ proposal, onVote, hasVoted, isVoting }) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedVotes  = formatVoteCount(proposal.voteCount);
  const relativeTime    = formatRelativeTime(proposal.timestamp);
  const shortAddress    = truncateAddress(proposal.proposer, 4, 4);
  const cat             = proposal.category || 'Tech';
  const catStyle        = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Tech;
  const dotStyle        = CATEGORY_DOT[cat]    || CATEGORY_DOT.Tech;
  const dl              = deadlineInfo(proposal.deadline);

  const truncatedDesc = proposal.description.length > 120
    ? proposal.description.slice(0, 120) + '…'
    : proposal.description;

  const isDisabled = hasVoted || isVoting || dl.expired;

  return (
    <article
      className={`bg-slate-800 rounded-2xl p-5 border border-slate-700/50
        transition-all duration-300 cursor-pointer
        ${isHovered && !dl.expired ? 'shadow-xl shadow-pink-500/10 border-pink-500/30' : 'shadow-lg'}
        hover:-translate-y-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar address={proposal.proposer} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium truncate">@{shortAddress}</span>
              <span className="text-slate-500 text-sm">•</span>
              <span className="text-slate-400 text-sm">{relativeTime}</span>
            </div>
          </div>
        </div>

        {/* Deadline badge */}
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
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{proposal.title}</h3>

      {/* Category badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${catStyle}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
          {cat}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-4 line-clamp-3">{truncatedDesc}</p>

      {/* Vote Section */}
      <div className="space-y-3">
        <button
          onClick={() => !isDisabled && onVote && onVote(proposal.id)}
          disabled={isDisabled}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${dl.expired
              ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed border border-slate-600'
              : hasVoted
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-lg hover:shadow-pink-500/30 active:scale-[0.98]'
            }
            ${isVoting ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isVoting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              VOTING…
            </>
          ) : dl.expired ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              VOTING CLOSED
            </>
          ) : hasVoted ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              VOTED
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              VOTE NOW
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1"><VoteProgressBar voteCount={proposal.voteCount} /></div>
          <span className={`text-sm font-bold ${hasVoted ? 'text-pink-400' : 'text-pink-500'}`}>
            {formattedVotes} Votes
          </span>
        </div>
      </div>
    </article>
  );
}
