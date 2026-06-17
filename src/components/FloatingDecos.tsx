import React from 'react';
import { motion } from 'framer-motion';

const DECOS = [
  { emoji: '😤', top: '8%',  left: '3%',  size: '2.5rem' },
  { emoji: '💀', top: '15%', right: '4%', size: '2rem' },
  { emoji: '🔥', top: '35%', left: '1%',  size: '2.2rem' },
  { emoji: '🤡', top: '50%', right: '2%', size: '2.4rem' },
  { emoji: '💥', top: '70%', left: '2%',  size: '2rem' },
  { emoji: '☠️', top: '80%', right: '3%', size: '2.3rem' },
  { emoji: '😈', top: '90%', left: '4%',  size: '1.8rem' },
  { emoji: '🎯', top: '25%', left: '0.5%',size: '1.9rem' },
];

export const FloatingDecos: React.FC = () => {
  return (
    <>
      {DECOS.map((d, i) => (
        <motion.div
          key={i}
          style={{
            position: 'fixed',
            top: d.top,
            left: 'left' in d ? d.left : undefined,
            right: 'right' in d ? d.right : undefined,
            fontSize: d.size,
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          animate={{
            y: [0, -14, -6, -14, 0],
            rotate: [0, 8, -6, 4, 0],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        >
          {d.emoji}
        </motion.div>
      ))}
    </>
  );
};
