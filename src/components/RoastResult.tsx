import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoastResponse } from '../services/gemini';
import { useTypewriter } from '../hooks/useAnimations';
import html2canvas from 'html2canvas';

interface RoastResultProps {
  result: RoastResponse | null;
  onCopy: () => void;
  onShare: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const FIRE_SETS: Record<number, string> = {
  1: '🔥',
  2: '🔥🔥',
  3: '🔥🔥🔥',
  4: '🔥🔥🔥🔥',
};

const DAMAGE_COLORS: Record<number, string> = {
  1: '#42e695',
  2: '#ffe156',
  3: '#ff9800',
  4: '#ff5252',
};

const METER_LABELS = ['Tame', 'Roasted', 'Scorched', 'Obliterated'];

export const RoastResult: React.FC<RoastResultProps> = ({
  result, onCopy, onShare, showToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shake, setShake] = useState(false);
  const { displayed, done } = useTypewriter(result?.roast ?? '', 16);

  useEffect(() => {
    if (result) {
      setShake(true);
      setTimeout(() => setShake(false), 700);
    }
  }, [result]);

  const handleDownload = async () => {
    if (!cardRef.current || !result) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = 'roast-maker.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Downloaded roast image! 📸', 'success');
    } catch {
      showToast('Download failed, try copying instead', 'error');
    }
  };

  const getMeterLabel = (score: number) => {
    if (score < 25) return METER_LABELS[0];
    if (score < 50) return METER_LABELS[1];
    if (score < 75) return METER_LABELS[2];
    return METER_LABELS[3];
  };

  if (!result) return null;

  const damageColor = DAMAGE_COLORS[result.damageLevel] || '#ff5252';
  const fires       = FIRE_SETS[result.damageLevel] || '🔥';

  return (
    <AnimatePresence>
      {result && (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ padding: '0 0 40px' }}
        >
          <div className="container">
            <motion.div
              ref={cardRef}
              className={`brut-card ${shake ? 'shake' : ''}`}
              style={{
                background: 'var(--brut-surface)',
                boxShadow: `8px 8px 0 ${damageColor}, 12px 12px 0 var(--brut-black)`,
                border: `4px solid var(--brut-black)`,
                padding: '36px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                background: `repeating-linear-gradient(-45deg, ${damageColor}, ${damageColor} 6px, var(--brut-black) 6px, var(--brut-black) 12px)`,
              }} />

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'var(--brut-primary)',
                    border: 'var(--brut-border-heavy)',
                    padding: '6px 16px',
                    fontWeight: 900, fontSize: '0.8rem',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: '#fff', marginBottom: '8px',
                  }}>
                    🔥 YOUR ROAST
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem',
                      color: damageColor, border: `3px solid ${damageColor}`,
                      padding: '2px 12px', display: 'inline-block',
                    }}>
                      SCORE: {result.score}/100
                    </span>
                    {result.fromCache && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.7rem',
                        opacity: 0.5, letterSpacing: '1px',
                      }}>
                        ⚡ CACHED
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  background: damageColor, border: 'var(--brut-border-heavy)',
                  boxShadow: 'var(--brut-shadow)', padding: '12px 20px',
                  textAlign: 'center', minWidth: '140px',
                }}>
                  <div style={{
                    fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase',
                    letterSpacing: '1.5px', marginBottom: '4px', opacity: 0.7,
                  }}>
                    Roast Intensity
                  </div>
                  <div style={{ fontSize: '1.4rem', lineHeight: 1.2 }}>
                    {fires.split('').map((f, i) => (
                      <motion.span
                        key={i}
                        className="damage-skull"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 300 }}
                      >
                        {f}
                      </motion.span>
                    ))}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '0.85rem', marginTop: '4px' }}>
                    {result.damageLabel}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'var(--brut-bg)', border: 'var(--brut-border-heavy)',
                padding: '24px', marginBottom: '24px', minHeight: '100px', position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: -14, left: 16,
                  background: 'var(--brut-secondary)', border: 'var(--brut-border-thick)',
                  padding: '2px 10px', fontWeight: 800, fontSize: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  🎤 THE ROAST
                </span>
                <p style={{
                  fontFamily: 'var(--font-primary)', fontWeight: 600,
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', lineHeight: 1.7,
                  color: 'var(--brut-text)', whiteSpace: 'pre-wrap',
                }}>
                  {displayed}
                  {!done && <span className="typewriter-cursor" />}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: '8px',
                  fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  <span>📊 ROAST ANALYTICS</span>
                  <span style={{ color: damageColor, fontFamily: 'var(--font-mono)' }}>
                    {result.score}% — {getMeterLabel(result.score)}
                  </span>
                </div>
                <div className="brut-progress-track" style={{ height: '24px' }}>
                  <motion.div
                    className="brut-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginTop: '6px',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, opacity: 0.6,
                }}>
                  {METER_LABELS.map(l => <span key={l}>{l}</span>)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="brut-btn brut-btn-green brut-btn-sm" onClick={onCopy}>
                  📋 Copy Roast
                </button>
                <button className="brut-btn brut-btn-purple brut-btn-sm" onClick={onShare}>
                  🔗 Share
                </button>
                <button className="brut-btn brut-btn-yellow brut-btn-sm" onClick={handleDownload}>
                  📸 Download
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
