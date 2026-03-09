'use client';

import React, { useState } from 'react';
import { formatVoteCount, formatRelativeTime, truncateAddress } from '../utils/web3';

/**
 * User Avatar Placeholder
 * Generates a consistent avatar based on address
 */
function UserAvatar({ address, size = "w-10 h-10" }) {
  // Generate a deterministic color from address
  const getColorFromAddress = (addr) => {
    if (!addr) return 'bg-slate-600';
    const colors = [
      'bg-pink-500', 'bg-purple-500', 'bg-blue-500', 
      'bg-cyan-500', 'bg-teal-500', 'bg-green-500',
      'bg-yellow-500', 'bg-orange-500', 'bg-red-500'
    ];
    const index = parseInt(addr.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  return (
    <div className={`${size} ${getColorFromAddress(address)} rounded-full flex items-center justify-center`}>
      <span className="text-white text-sm font-bold">
        {address ? address.slice(2, 4).toUpperCase() : '??'}
      </span>
    </div>
  );
}

/**
 * Vote Progress Bar Component
 */
function VoteProgressBar({ voteCount, maxVotes = 1000 }) {
  const percentage = Math.min((voteCount / maxVotes) * 100, 100);
  
  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * Proposal Card Component
 * Matches the wireframe design precisely
 */
export default function ProposalCard({ proposal, onVote, hasVoted, isVoting }) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedVotes = formatVoteCount(proposal.voteCount);
  const relativeTime = formatRelativeTime(proposal.timestamp);
  const shortAddress = truncateAddress(proposal.proposer, 4, 4);

  // Truncate description if too long
  const truncatedDescription = proposal.description.length > 120 
    ? proposal.description.slice(0, 120) + '...' 
    : proposal.description;

  return (
    <article
      className={`
        bg-slate-800 rounded-2xl p-5 border border-slate-700/50
        transition-all duration-300 cursor-pointer
        ${isHovered ? 'shadow-xl shadow-pink-500/10 border-pink-500/30' : 'shadow-lg'}
        hover:-translate-y-1
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header - User Info */}
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar address={proposal.proposer} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium truncate">
              @{shortAddress}
            </span>
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-400 text-sm">
              {relativeTime}
            </span>
          </div>
        </div>
      </div>

      {/* Proposal Title */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
        {proposal.title}
      </h3>

      {/* Proposal Description */}
      <p className="text-slate-300 text-sm mb-4 line-clamp-3">
        {truncatedDescription}
      </p>

      {/* Vote Section */}
      <div className="space-y-3">
        {/* Vote Button */}
        <button
          onClick={() => onVote && onVote(proposal.id)}
          disabled={hasVoted || isVoting}
          className={`
            w-full py-3 px-4 rounded-xl font-semibold text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${hasVoted 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-lg hover:shadow-pink-500/30 active:scale-[0.98]'
            }
            ${isVoting ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {hasVoted ? (
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

        {/* Vote Count & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <VoteProgressBar voteCount={proposal.voteCount} />
          </div>
          <span className={`text-sm font-bold ${hasVoted ? 'text-pink-400' : 'text-pink-500'}`}>
            {formattedVotes} Votes
          </span>
        </div>
      </div>
    </article>
  );
}
