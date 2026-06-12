import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function Card({ children, header, className = '' }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`.trim()}>
      {header && <div className={styles['card-header']}>{header}</div>}
      <div className={styles['card-body']}>{children}</div>
    </div>
  );
}
