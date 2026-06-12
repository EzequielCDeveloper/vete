import { useCallback, useState, type ReactNode } from 'react';
import {
  FaPaw,
  FaBars,
  FaChartPie,
  FaCalendarPlus,
  FaCalendarCheck,
  FaSyringe,
  FaFolderOpen,
  FaUsersCog,
  FaUserCircle,
  FaSignOutAlt,
  FaLock,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { PasswordChangeModal } from '../../features/users/PasswordChangeModal';
import styles from './Sidebar.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <FaChartPie /> },
  { id: 'nueva-cita', label: 'Nueva Cita', icon: <FaCalendarPlus /> },
  { id: 'gestion-citas', label: 'Buscar Cita', icon: <FaCalendarCheck /> },
  { id: 'procedimientos', label: 'Procedimientos', icon: <FaSyringe /> },
  { id: 'historial-medico', label: 'Historial Médico', icon: <FaFolderOpen /> },
  { id: 'usuarios', label: 'Usuarios', icon: <FaUsersCog />, adminOnly: true },
];

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isAdmin: boolean;
  userName: string;
  userRole: string;
  mobileOpen: boolean;
}

export function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  isAdmin,
  userName,
  userRole,
  mobileOpen,
}: SidebarProps) {
  const { logout } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleNavClick = useCallback(
    (view: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      onNavigate(view);
    },
    [onNavigate],
  );

  const sidebarClass = [
    styles.sidebar,
    collapsed && styles.collapsed,
    mobileOpen && styles.mobileOpen,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClass}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <FaPaw className={styles.brandIcon} />
          <span className={styles.brandText}>VetCare</span>
        </div>
        <button
          className={styles.toggle}
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {visibleItems.map((item) => {
            const linkClass = [
              styles.navLink,
              activeView === item.id && styles.active,
            ]
              .filter(Boolean)
              .join(' ');
            const itemClass = [
              styles.navItem,
              item.adminOnly && styles.adminSeparator,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={item.id} className={itemClass}>
                <a
                  href="#"
                  className={linkClass}
                  onClick={handleNavClick(item.id)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userSection}>
          <FaUserCircle className={styles.avatar} />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        </div>
        <button className={styles.passwordBtn} onClick={() => setPasswordModalOpen(true)}>
          <FaLock /> <span className={styles.logoutLabel}>Cambiar Contraseña</span>
        </button>
        <button className={styles.logoutBtn} onClick={logout}>
          <FaSignOutAlt /> <span className={styles.logoutLabel}>Cerrar Sesión</span>
        </button>
      </div>

      <PasswordChangeModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        mode="own"
      />
    </aside>
  );
}
