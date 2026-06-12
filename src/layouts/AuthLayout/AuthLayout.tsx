import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.backdrop} />
      <div className={styles.wrapper}>{children}</div>
    </div>
  );
}
