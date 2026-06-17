import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const icons = { success: '✅', error: '❌', info: '💡' };
const colors = { success: '#42e695', error: '#ff5252', info: '#ffe156' };

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="toast"
        style={{ borderLeft: `6px solid ${colors[type]}` }}
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <span style={{ fontSize: '1.4rem' }}>{icons[type]}</span>
        <span style={{ fontWeight: 700 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: '1rem',
          }}
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
