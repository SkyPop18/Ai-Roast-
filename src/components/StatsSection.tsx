import React from 'react';
import { motion } from 'framer-motion';
import { useAnimatedCounter, useInView } from '../hooks/useAnimations';

interface StatsData {
  totalRoasts: number;
  usersEmoDamaged: number;
  avgBurnTemp: number;
  todaysVictims: number;
}

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  emoji: string;
  inView: boolean;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, suffix = '', emoji, inView, index }) => {
  const count = useAnimatedCounter(value, 2200, inView);
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: 'var(--brut-shadow-xl)' }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
      <div className="stat-number">{count.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
};

interface StatsSectionProps {
  stats: StatsData;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const { ref, inView } = useInView(0.2);

  const statItems = [
    { label: 'Roasts Generated',    value: stats.totalRoasts,      emoji: '🔥', suffix: '' },
    { label: 'Targets Destroyed',   value: stats.usersEmoDamaged,  emoji: '💀', suffix: '' },
    { label: 'Avg Spice Level',     value: stats.avgBurnTemp,      emoji: '🌡', suffix: '°' },
    { label: 'Roasts Today',        value: stats.todaysVictims,    emoji: '🎯', suffix: '' },
  ];

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container" ref={ref}>
        <div className="section-title-wrap">
          <div className="section-title-bar" />
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', whiteSpace: 'nowrap' }}>
            📊 ROAST ANALYTICS
          </h2>
          <div className="section-title-bar" />
        </div>

        <div className="grid-4">
          {statItems.map((item, i) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              suffix={item.suffix}
              emoji={item.emoji}
              inView={inView}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
