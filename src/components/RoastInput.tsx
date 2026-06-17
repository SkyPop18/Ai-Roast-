import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXAMPLE_INPUTS } from '../services/gemini';

const STYLES = [
  { id: 'Funny',            emoji: '😂' },
  { id: 'Savage',           emoji: '☠️' },
  { id: 'Sarcastic',        emoji: '🙄' },
  { id: 'Corporate',        emoji: '💼' },
  { id: 'Gen Z',            emoji: '✌️' },
  { id: 'Dark Humor',       emoji: '🖤' },
  { id: 'One-Liner',        emoji: '⚡' },
  { id: 'Stand-Up Comedy',  emoji: '🎤' },
];

const LENGTHS = [
  { id: 'one-liner', label: 'One-Liner' },
  { id: 'short',     label: 'Short'     },
  { id: 'medium',    label: 'Medium'    },
  { id: 'long',      label: 'Long'      },
];

const INTENSITIES = [
  { level: 1, label: 'Mild',     emoji: '🌶',  color: '#42e695' },
  { level: 2, label: 'Spicy',    emoji: '🌶🌶', color: '#ffe156' },
  { level: 3, label: 'Savage',   emoji: '🔥',  color: '#ff9800' },
  { level: 4, label: 'Ruthless', emoji: '💀',  color: '#ff5252' },
  { level: 5, label: 'Nuclear',  emoji: '☢️',  color: '#c62828' },
];

const THINKING_PHRASES = [
  '🧠 Crafting your roast...',
  '💀 Sharpening the blade...',
  '😈 Dialing up the savage...',
  '🔥 Loading maximum burn...',
  '🎯 Taking aim...',
];

const MAX_CHARS = 500;

interface RoastInputProps {
  value: string;
  onChange: (v: string) => void;
  onRoast: () => void;
  isLoading: boolean;
  style: string;
  onStyleChange: (s: string) => void;
  length: string;
  onLengthChange: (l: string) => void;
  intensity: number;
  onIntensityChange: (i: number) => void;
  roastsRemaining: number;
}

const PillRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div style={{ marginTop: '18px' }}>
    <div style={{
      fontFamily: 'var(--font-primary)',
      fontWeight: 900,
      fontSize: '0.68rem',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '8px',
      opacity: 0.65,
      color: 'var(--brut-text)',
    }}>
      {label}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {children}
    </div>
  </div>
);

interface PillProps {
  selected: boolean;
  onClick: () => void;
  accent?: string;
  children: React.ReactNode;
}

const Pill: React.FC<PillProps> = ({ selected, onClick, accent, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '5px 13px',
      border: '2.5px solid var(--brut-black)',
      background: selected ? (accent || 'var(--brut-primary)') : 'var(--brut-surface)',
      color: selected ? (accent ? '#000' : '#fff') : 'var(--brut-text)',
      fontFamily: 'var(--font-primary)',
      fontWeight: 800,
      fontSize: '0.78rem',
      letterSpacing: '0.3px',
      cursor: 'pointer',
      boxShadow: selected ? 'none' : '3px 3px 0 var(--brut-black)',
      transform: selected ? 'translate(2px,2px)' : 'none',
      transition: 'all 0.1s',
      userSelect: 'none',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </button>
);

export const RoastInput: React.FC<RoastInputProps> = ({
  value, onChange, onRoast, isLoading,
  style, onStyleChange,
  length, onLengthChange,
  intensity, onIntensityChange,
  roastsRemaining,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [thinkingIdx, setThinkingIdx] = React.useState(0);
  const [buttonPressed, setButtonPressed] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(() => {
      setThinkingIdx(i => (i + 1) % THINKING_PHRASES.length);
    }, 1500);
    return () => clearInterval(t);
  }, [isLoading]);

  const handleRandom = () => {
    const r = EXAMPLE_INPUTS[Math.floor(Math.random() * EXAMPLE_INPUTS.length)];
    onChange(r);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && value.trim() && roastsRemaining > 0) onRoast();
    }
  };

  const handleButtonClick = () => {
    if (isLoading || !value.trim() || roastsRemaining <= 0) return;
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 200);
    onRoast();
  };

  const charCount = value.length;
  const charPct   = charCount / MAX_CHARS;
  const charColor = charPct > 0.9 ? '#ff5252' : charPct > 0.7 ? '#ff9800' : 'var(--brut-text)';
  const limitReached = roastsRemaining <= 0;

  const remainingColor = roastsRemaining === 0
    ? '#ff5252'
    : roastsRemaining === 1
    ? '#ff9800'
    : 'var(--brut-text)';

  return (
    <section style={{ padding: '0 0 40px' }}>
      <div className="container">
        <motion.div
          className="brut-card"
          style={{ background: 'var(--brut-surface)', boxShadow: 'var(--brut-shadow-xl)', padding: '32px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '16px', flexWrap: 'wrap', gap: '10px',
          }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--brut-primary)',
              color: '#fff',
              fontWeight: 900,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '4px 12px',
              border: 'var(--brut-border-thick)',
            }}>
              WHO OR WHAT TO ROAST
            </span>
            <button
              className="brut-btn brut-btn-yellow brut-btn-sm"
              onClick={handleRandom}
              type="button"
              disabled={isLoading}
            >
              🎲 Random Example
            </button>
          </div>

          <textarea
            ref={textareaRef}
            className="brut-textarea"
            placeholder="e.g. My friend who always arrives 2 hours late and has zero guilt about it..."
            value={value}
            onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            rows={5}
            disabled={isLoading}
            style={{ resize: 'vertical', minHeight: '140px', maxHeight: '280px' }}
          />

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: charColor,
            marginTop: '6px',
            transition: 'color 0.3s',
          }}>
            {charCount} / {MAX_CHARS}
            {charCount === 0 && (
              <span style={{ opacity: 0.5, marginLeft: '10px' }}>← describe your roast target</span>
            )}
          </div>

          <PillRow label="Roast Style">
            {STYLES.map(s => (
              <Pill key={s.id} selected={style === s.id} onClick={() => onStyleChange(s.id)}>
                {s.emoji} {s.id}
              </Pill>
            ))}
          </PillRow>

          <PillRow label="Roast Length">
            {LENGTHS.map(l => (
              <Pill key={l.id} selected={length === l.id} onClick={() => onLengthChange(l.id)}>
                {l.label}
              </Pill>
            ))}
          </PillRow>

          <PillRow label="Intensity">
            {INTENSITIES.map(i => (
              <Pill
                key={i.level}
                selected={intensity === i.level}
                onClick={() => onIntensityChange(i.level)}
                accent={i.color}
              >
                {i.emoji} {i.label}
              </Pill>
            ))}
          </PillRow>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: remainingColor,
              transition: 'color 0.3s',
            }}>
              {roastsRemaining === Infinity ? (
                <span>🔥 Unlimited roasts (Test Mode)</span>
              ) : limitReached ? (
                <span>🚫 Daily limit reached — come back tomorrow!</span>
              ) : (
                <span>🔥 {roastsRemaining}/{length === 'long' ? 1 : length === 'medium' ? 2 : 3} roasts remaining today</span>
              )}
            </div>

            <motion.button
              className="brut-btn brut-btn-xl"
              onClick={handleButtonClick}
              disabled={isLoading || !value.trim() || limitReached}
              animate={buttonPressed ? { x: 6, y: 6 } : { x: 0, y: 0 }}
              whileHover={!isLoading && value.trim() && !limitReached ? { x: 2, y: 2 } : {}}
              style={{
                boxShadow: buttonPressed ? 'none' : 'var(--brut-shadow-xl)',
                transition: 'box-shadow 0.15s',
                opacity: limitReached ? 0.5 : 1,
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="loading-dots"><span /><span /><span /></span>
                  CREATING...
                </span>
              ) : limitReached ? (
                <>🚫 LIMIT REACHED</>
              ) : (
                <>🔥 CREATE ROAST</>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  border: 'var(--brut-border-thick)',
                  background: 'var(--brut-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', fontSize: '1.2rem' }}
                >
                  ⚡
                </motion.span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={thinkingIdx}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {THINKING_PHRASES[thinkingIdx]}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
