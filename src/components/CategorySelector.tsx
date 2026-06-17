import React from 'react';
import { motion } from 'framer-motion';

export const CATEGORIES = [
  { id: 'Startup',   label: 'Startup Founders', emoji: '🚀' },
  { id: 'Coding',    label: 'Bad Code',          emoji: '💻' },
  { id: 'Instagram', label: 'Influencers',        emoji: '📸' },
  { id: 'Twitter',   label: 'Twitter Takes',      emoji: '🐦' },
  { id: 'Dating',    label: 'Dating Profiles',    emoji: '💔' },
  { id: 'Business',  label: 'Corporate Life',     emoji: '💼' },
  { id: 'Student',   label: 'Student Life',       emoji: '📚' },
  { id: 'Gamer',     label: 'Gamers',             emoji: '🎮' },
];

interface CategorySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect }) => {
  return (
    <section style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="section-title-wrap">
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', whiteSpace: 'nowrap' }}>
            🎯 CHOOSE ROAST CATEGORY
          </h2>
          <div className="section-title-bar" />
        </div>

        <div className="grid-4" style={{ gap: '16px' }}>
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              className={`category-card ${selected === cat.id ? 'selected' : ''}`}
              onClick={() => onSelect(cat.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{cat.emoji}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{cat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
