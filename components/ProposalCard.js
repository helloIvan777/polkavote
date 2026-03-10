'use client';

import React, { useState } from 'react';
import { formatDEV, formatRelativeTime, truncateAddress } from '../utils/web3';

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

/**
 * Returns deadline / funding status info for a project.
 * status: 'active' | 'success' | 'failed' | 'closing'
 */
export function deadlineInfo(deadlineMs, raisedAmount, targetAmount) {
  if (!deadlineMs) return { label: '', status: 'active' };
  const diff = deadlineMs - Date.now();

  if (diff <= 0) {
    // Deadline passed — determine outcome
    if (raisedAmount >= targetAmount) {
      return { label: 'Funded! 🎉', status: 'success' };
    }
    return { label: 'Funding Failed', status: 'failed' };
  }

  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days  >= 1) return { label: `${days}d ${hours}h left`, status: 'active' };
  if (hours >= 1) return { label: `${hours}h left`,          status: 'closing' };
  return { label: 'Closes soon', status: 'closing' };
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

function FundingProgressBar({ raisedAmount, targetAmount }) {
  const pct = targetAmount > 0
    ? Math.min((raisedAmount / targetAmount) * 100, 100)
    : 0;
  const isSuccess = pct >= 100;
  return (
    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          isSuccess
            ? 'bg-gradient-to-r from-emerald-500 to-green-400'
            : 'bg-gradient-to-r from-pink-500 to-pink-600'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ProposalCard({ proposal, onContribute, onCardClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const relativeTime = formatRelativeTime(proposal.timestamp);
  const shortAddress = truncateAddress(proposal.creator, 4, 4);
  const cat          = proposal.category || 'Tech';
  const catStyle     = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Tech;
  const dotStyle     = CATEGORY_DOT[cat]    || CATEGORY_DOT.Tech;
  const dl           = deadlineInfo(proposal.deadline, proposal.raisedAmount, proposal.targetAmount);
  const isExpired    = dl.status === 'success' || dl.status === 'failed';

  const truncatedDesc = proposal.description.length > 100
    ? proposal.description.slice(0, 100) + '…'
    : proposal.description;

  // Status badge styles
  const statusBadgeStyle = {
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    failed:  'bg-red-500/15     text-red-400     border-red-500/30',
    closing: 'bg-amber-500/15   text-amber-300   border-amber-500/30',
    active:  'bg-amber-500/15   text-amber-300   border-amber-500/30',
  }[dl.status] ?? 'bg-slate-700/60 text-slate-400 border-slate-600';

  // CTA button appearance
  const btnLabel = {
    success: '🎉 Fully Funded',
    failed:  '✕ Goal Not Met',
    closing: '⚡ BACK PROJECT',
    active:  '💜 BACK PROJECT',
  }[dl.status] ?? '💜 BACK PROJECT';

  const canContribute = !isExpired;

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
        {/* Header: avatar + meta + status badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar address={proposal.creator} />
            <div className="min-w-0">
              <p className="text-white font-medium truncate text-sm">@{shortAddress}</p>
              <p className="text-slate-400 text-xs">{relativeTime}</p>
            </div>
          </div>

          {dl.label && (
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadgeStyle}`}>
              {dl.label}
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

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
          {truncatedDesc}
        </p>
      </div>

      {/* ── Card Footer ── */}
      <div className="px-5 pb-5 pt-1 space-y-3 mt-auto">
        {/* Funding progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Raised: <span className="text-white font-semibold">{formatDEV(proposal.raisedAmount)}</span>
            </span>
            <span className="text-slate-500">
              Goal: {formatDEV(proposal.targetAmount)}
            </span>
          </div>
          <FundingProgressBar
            raisedAmount={proposal.raisedAmount}
            targetAmount={proposal.targetAmount}
          />
          <p className="text-right text-[10px] text-slate-500">
            {proposal.targetAmount > 0
              ? `${Math.min(((proposal.raisedAmount / proposal.targetAmount) * 100), 100).toFixed(1)}% funded`
              : '0% funded'}
          </p>
        </div>

        {/* CTA button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canContribute && onContribute) onContribute(proposal.id);
            else if (!isExpired) onCardClick && onCardClick(proposal);
          }}
          disabled={isExpired}
          className={`
            w-full py-2.5 px-4 rounded-xl font-semibold text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${dl.status === 'success'
              ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-600/30 cursor-default'
              : dl.status === 'failed'
              ? 'bg-slate-700/60 text-slate-500 border border-slate-600 cursor-default'
              : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-md hover:shadow-pink-500/30 active:scale-95'
            }
          `}
        >
          {btnLabel}
        </button>
      </div>
    </article>
  );
}
