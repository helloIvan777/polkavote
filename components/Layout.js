'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * PolkaVote Logo Component
 * SVG placeholder logo matching the wireframe design
 */
function PolkaVoteLogo({ className = "w-10 h-10" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill="#DB2777" />
      
      {/* Inner design - stylized PV */}
      <path 
        d="M14 32V16L20 28L26 16V32" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M30 16V32" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M34 16L28 32" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Decorative dots */}
      <circle cx="12" cy="12" r="2" fill="white" />
      <circle cx="36" cy="36" r="2" fill="white" />
    </svg>
  );
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
 * Nano Banana Integration Badge
 * Placeholder badge as shown in wireframe
 */
function NanoBananaBadge() {
  return (
    <div className="mt-auto p-4">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🍌</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-yellow-400">Nano Banana</p>
            <p className="text-[10px] text-slate-400">Integration Ready</p>
          </div>
        </div>
      </div>
    </div>
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
    <aside className="hidden lg:flex flex-col w-64 bg-slate-800 border-r border-slate-700/50 min-h-screen">
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

      {/* Nano Banana Badge */}
      <NanoBananaBadge />
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
 * Main Layout Component
 * Wraps all pages with consistent navigation
 */
export default function Layout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar pathname={pathname} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-800 border-b border-slate-700/50 px-4 py-3">
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
