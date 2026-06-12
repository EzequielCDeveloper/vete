import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

export function StatCard({ icon, value, label, variant = 'primary' }: StatCardProps) {
  return (
    <div className={styles['stat-card']}>
      <div className={`${styles['stat-icon']} ${styles[`stat-icon--${variant}`]}`}>
        {icon}
      </div>
      <div className={styles['stat-info']}>
        <span className={styles['stat-value']}>{value}</span>
        <span className={styles['stat-label']}>{label}</span>
      </div>
    </div>
  );
}
