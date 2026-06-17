import React from 'react';
import { motion } from 'framer-motion';

const MARQUEE_ITEMS = [
  '🔥 ROAST ANYTHING',
  '💀 CUSTOM TARGETS',
  '😈 8 STYLES',
  '☠️ AI POWERED',
  '🎯 INSTANT ROASTS',
  '💥 SAVAGE MODE',
  '🤖 GEMINI AI',
  '😂 ACTUALLY FUNNY',
];

export const Marquee: React.FC = () => {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-wrap">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i}>{item} ★</span>
        ))}
      </div>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  return (
    <section style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, rotate: -5, scale: 0.8 }}
          animate={{ opacity: 1, rotate: -2, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'inline-block', marginBottom: '24px' }}
        >
          <div className="sticker">⚡ Powered by Gemini AI</div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(3.2rem, 10vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-3px',
            marginBottom: '16px',
            color: 'var(--brut-text)',
          }}
        >
          CREATE{' '}
          <span
            style={{
              display: 'inline-block',
              background: 'var(--brut-primary)',
              color: '#fff',
              padding: '0 12px',
              transform: 'rotate(-1deg)',
              border: 'var(--brut-border-heavy)',
              boxShadow: 'var(--brut-shadow-xl)',
            }}
          >
            SAVAGE
          </span>
          <br />
          ROASTS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '32px',
            color: 'var(--brut-text)',
            opacity: 0.8,
          }}
        >
          Create sharp, funny and custom roasts in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}
        >
          {[
            { emoji: '🎯', label: 'Any Target' },
            { emoji: '🎨', label: '8 Styles' },
            { emoji: '⚡', label: 'Instant' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="brut-tag"
              style={{ background: 'var(--brut-surface)' }}
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
            >
              {item.emoji} {item.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
