import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoastResponse } from '../services/gemini';

export interface HistoryEntry {
  id: string;
  input: string;
  roast: string;
  score: number;
  damageLevel: number;
  damageLabel: string;
  category: string;
  style: string;
  length: string;
  intensity: number;
  timestamp: number;
}

interface RoastHistoryProps {
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const DAMAGE_COLORS: Record<number, string> = {
  1: '#42e695', 2: '#ffe156', 3: '#ff9800', 4: '#ff5252',
};

const STYLE_EMOJI: Record<string, string> = {
  'Funny': '😂', 'Savage': '☠️', 'Sarcastic': '🙄', 'Corporate': '💼',
  'Gen Z': '✌️', 'Dark Humor': '🖤', 'One-Liner': '⚡', 'Stand-Up Comedy': '🎤',
};

const LENGTH_LABEL: Record<string, string> = {
  'one-liner': '1-liner', 'short': 'Short', 'medium': 'Medium', 'long': 'Long',
};

export const RoastHistory: React.FC<RoastHistoryProps> = ({ history, onSelectEntry, onClear }) => {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  const displayHistory = expanded ? history : history.slice(0, 5);

  return (
    <section style={{ padding: '40px 0 60px' }}>
      <div className="container">
        <div className="section-title-wrap" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', whiteSpace: 'nowrap' }}>
            📜 ROAST HISTORY
          </h2>
          <div className="section-title-bar" />
          <button
            className="brut-btn brut-btn-black brut-btn-sm"
            onClick={onClear}
            style={{ flexShrink: 0 }}
          >
            🗑 Clear
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {displayHistory.map((entry, i) => (
              <motion.div
                key={entry.id}
                className="history-item"
                onClick={() => onSelectEntry(entry)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.99 }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.7,
                    }}>
                      🎯 {entry.input.slice(0, 80)}{entry.input.length > 80 ? '...' : ''}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      🔥 {entry.roast.slice(0, 100)}{entry.roast.length > 100 ? '...' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {entry.style && (
                        <span style={{
                          background: 'var(--brut-bg)', border: 'var(--brut-border-thick)',
                          padding: '1px 8px', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.5px',
                        }}>
                          {STYLE_EMOJI[entry.style] || ''} {entry.style}
                        </span>
                      )}
                      {entry.length && (
                        <span style={{
                          background: 'var(--brut-bg)', border: 'var(--brut-border-thick)',
                          padding: '1px 8px', fontWeight: 800, fontSize: '0.7rem',
                        }}>
                          {LENGTH_LABEL[entry.length] || entry.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    gap: '4px', flexShrink: 0,
                  }}>
                    <span style={{
                      background: DAMAGE_COLORS[entry.damageLevel],
                      border: 'var(--brut-border-thick)',
                      padding: '2px 10px', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.5px',
                    }}>
                      {entry.score}/100 — {entry.damageLabel}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, opacity: 0.5,
                    }}>
                      {new Date(entry.timestamp).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {history.length > 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              className="brut-btn brut-btn-yellow"
              onClick={() => setExpanded(!expanded)}
              style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '1px',
                padding: '10px 24px',
              }}
            >
              {expanded ? '📜 SHOW LESS' : `📜 SHOW MORE (${history.length - 5} MORE)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export function makeHistoryEntry(
  input: string,
  category: string,
  style: string,
  length: string,
  intensity: number,
  result: RoastResponse,
): HistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    input,
    roast: result.roast,
    score: result.score,
    damageLevel: result.damageLevel,
    damageLabel: result.damageLabel,
    category,
    style,
    length,
    intensity,
    timestamp: Date.now(),
  };
}
