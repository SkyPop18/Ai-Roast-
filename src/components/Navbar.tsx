import React from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, onToggleDark }) => {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--navbar-bg)',
        borderBottom: 'var(--brut-border-heavy)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 0 var(--brut-black)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <motion.span
          style={{ fontSize: '2rem' }}
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        >
          🔥
        </motion.span>
        <span style={{
          fontFamily: 'var(--font-primary)',
          fontWeight: 900,
          fontSize: '1.3rem',
          letterSpacing: '-0.5px',
          color: 'var(--navbar-text)',
        }}>
          AI<span style={{ color: 'var(--brut-primary)' }}>ROAST</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'var(--navbar-text-muted)',
            opacity: 0.8,
          }}
          className="hide-mobile"
        >
          <kbd style={{
            border: 'var(--brut-border-thick)',
            padding: '2px 8px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.7rem',
            background: 'var(--navbar-kbd-bg)',
            color: 'var(--navbar-kbd-text)',
          }}>Ctrl + Enter</kbd>
          <span>to roast</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              color: 'var(--navbar-text)',
              opacity: darkMode ? 0.4 : 1,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </span>

          <div
            className={`brut-toggle ${darkMode ? 'active' : ''}`}
            onClick={onToggleDark}
            style={{ cursor: 'pointer' }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="knob" />
          </div>

          <span
            style={{
              color: 'var(--navbar-text)',
              opacity: darkMode ? 1 : 0.4,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </span>
        </div>
      </div>
    </motion.nav>
  );
};
