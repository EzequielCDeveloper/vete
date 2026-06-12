import { useState, useCallback, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  userName: string;
  userRole: string;
  isAdmin: boolean;
  viewTitle: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppLayout({
  children,
  activeView,
  onNavigate,
  userName,
  userRole,
  isAdmin,
  viewTitle,
  sidebarCollapsed = false,
  onToggleSidebar,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => setMobileOpen((prev) => !prev), []);
  const handleCloseMobile = useCallback(() => setMobileOpen(false), []);
  const handleNavigate = useCallback(
    (view: string) => {
      onNavigate(view);
      setMobileOpen(false);
    },
    [onNavigate],
  );

  const contentClass = [
    styles.content,
    sidebarCollapsed && styles.contentCollapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.layout}>
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={onToggleSidebar || (() => {})}
        isAdmin={isAdmin}
        userName={userName}
        userRole={userRole}
        mobileOpen={mobileOpen}
      />
      {mobileOpen && (
        <div className={styles.overlay} onClick={handleCloseMobile} />
      )}
      <div className={contentClass}>
        <TopBar
          title={viewTitle}
          userName={userName}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
