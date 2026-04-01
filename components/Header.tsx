'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/?filter=live', label: 'Live' },
  { href: '/fifa', label: 'FIFA' },
  { href: '/ucl', label: 'UCL' },
  { href: '/ufa', label: 'UFA' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">⚽</span>
            <span className="text-xl font-bold font-['Poppins'] text-white group-hover:text-highlight transition-colors">
              Football <span className="text-highlight">News Live</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'text-highlight bg-highlight/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label === 'Live' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="live-dot w-2 h-2"></span>
                      {link.label}
                    </span>
                  ) : link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-highlight/20 border border-highlight/30 rounded-full px-3 py-1">
              <span className="live-dot"></span>
              <span className="text-xs font-semibold text-highlight">LIVE</span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-3 border-t border-white/10 animate-fade-in" role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label === 'Live' && <span className="live-dot"></span>}
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
