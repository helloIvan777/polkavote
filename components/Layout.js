'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PolkaVoteLogo, ConnectWalletButton } from '../components/Header';

/**
 * Returns true once the user has scrolled the main content area at least 1px.
 * Used to show the header shadow only when scrolling.
 */
function useScrolled(ref) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 4);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [ref]);
  return scrolled;
}

/**
 * Navigation Icons
 */
function HomeIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function PlusIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function VoteIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ProfileIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

/**
 * Navigation Items Configuration
 */
const navItems = [
  { href: '/', label: 'HOME', icon: HomeIcon },
  { href: '/submit', label: 'SUBMIT IDEA', icon: PlusIcon },
  { href: '/votes', label: 'MY VOTES', icon: VoteIcon },
  { href: '/profile', label: 'PROFILE', icon: ProfileIcon },
];

/**
 * Desktop Sidebar Component
 */
function DesktopSidebar({ pathname }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-800 border-r border-slate-700/50 h-full flex-shrink-0 overflow-y-auto">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-3 group">
          <PolkaVoteLogo className="w-10 h-10 group-hover:scale-105 transition-transform" />
          <div>
            <h1 className="text-xl font-bold text-white">PolkaVote</h1>
            <p className="text-xs text-slate-400">Shape the Future</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * Mobile Bottom Navigation Component
 */
function MobileBottomNav({ pathname }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700/50 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-pink-500'
                  : 'text-slate-400'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom bg-slate-800" />
    </nav>
  );
}

/**
 * Desktop Top Header Component
 */
function DesktopTopBar({ scrolled }) {
  return (
    <header
      className={`
        hidden lg:flex items-center justify-between
        sticky top-0 z-50
        px-6 py-3
        border-b border-white/10
        backdrop-blur-[12px]
        transition-shadow duration-300
        ${scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : ''}
      `}
      style={{ backgroundColor: 'rgba(13, 15, 19, 0.82)' }}
    >
      <div className="flex items-center gap-2">
        <PolkaVoteLogo className="w-8 h-8" />
        <span className="text-lg font-bold text-white">PolkaVote</span>
      </div>
      <div className="flex items-center gap-4">
        <ConnectWalletButton />
      </div>
    </header>
  );
}

/**
 * Main Layout Component
 */
export default function Layout({ children }) {
  const pathname = usePathname();
  const scrollRef = React.useRef(null);
  const scrolled = useScrolled(scrollRef);

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Desktop Sidebar — sticky, full viewport height */}
      <DesktopSidebar pathname={pathname} />

      {/* Main Content Area — THIS is the scroll container, h-full keeps it viewport-locked */}
      <main ref={scrollRef} className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Desktop Top Bar */}
        <DesktopTopBar scrolled={scrolled} />

        {/* Mobile Header */}
        <header
          className={`
            lg:hidden
            sticky top-0 z-50
            px-4 py-3
            border-b border-white/10
            backdrop-blur-[12px]
            transition-shadow duration-300
            ${scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : ''}
          `}
          style={{ backgroundColor: 'rgba(13, 15, 19, 0.82)' }}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <PolkaVoteLogo className="w-8 h-8" />
              <span className="text-lg font-bold text-white">PolkaVote</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Bottom padding for mobile nav */}
        <div className="lg:hidden h-20" />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav pathname={pathname} />
    </div>
  );
}
