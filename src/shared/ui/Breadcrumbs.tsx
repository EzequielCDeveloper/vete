import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  view?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (view: string) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className={styles.item}>
            {index > 0 && <span className={styles.separator}>/</span>}
            {item.view && !isLast ? (
              <button
                className={styles.link}
                onClick={() => onNavigate?.(item.view!)}
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? styles.current : styles.label}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
