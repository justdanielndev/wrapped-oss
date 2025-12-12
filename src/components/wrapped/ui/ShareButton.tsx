import React from 'react';
import { motion } from 'framer-motion';

export default function ShareButton({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-6 py-3 rounded-full font-bold text-sm tracking-wide z-50
        ${isDark ? 'bg-wrapped-cream text-wrapped-black' : 'bg-wrapped-black text-wrapped-cream'}
      `}
    >
      Share this story
    </motion.button>
  );
}
