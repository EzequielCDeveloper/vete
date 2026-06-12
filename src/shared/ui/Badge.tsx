import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  variant: 'success' | 'info' | 'warning' | 'danger' | 'admin' | 'secretario' | 'veterinario';
}

export function Badge({ children, variant }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${variant}`]}`}>
      {children}
    </span>
  );
}
