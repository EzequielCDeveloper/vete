import { FaBars, FaUserCircle } from 'react-icons/fa';
import styles from './TopBar.module.css';

interface TopBarProps {
  title: string;
  userName: string;
  onMobileMenuToggle: () => void;
}

export function TopBar({ title, userName, onMobileMenuToggle }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.mobileToggle}
          onClick={onMobileMenuToggle}
          aria-label="Menu"
        >
          <FaBars />
        </button>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.right}>
        <span className={styles.user}>
          <FaUserCircle />
          <span>{userName}</span>
        </span>
      </div>
    </header>
  );
}
