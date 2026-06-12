import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import NewAppointmentPage from './features/appointments/NewAppointmentPage';
import AppointmentListPage from './features/appointments/AppointmentListPage';
import ProcedureListPage from './features/procedures/ProcedureListPage';
import UserListPage from './features/users/UserListPage';
import DayAppointmentsPage from './features/appointments/DayAppointmentsPage';
import MedicalHistoryPage from './features/medical/MedicalHistoryPage';

const VALID_VIEWS = ['dashboard', 'nueva-cita', 'gestion-citas', 'procedimientos', 'usuarios', 'citas-dia', 'historial-medico'] as const;
type ViewType = typeof VALID_VIEWS[number];

function isValidView(view: string): view is ViewType {
  return VALID_VIEWS.includes(view as ViewType);
}

const VIEW_TITLES: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  'nueva-cita': 'Nueva Cita',
  'gestion-citas': 'Buscar Cita',
  procedimientos: 'Tipos de Procedimientos',
  usuarios: 'Gestión de Usuarios',
  'citas-dia': 'Citas del Día',
  'historial-medico': 'Historial Médico',
};

function AppContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Auto-collapse sidebar when entering Nueva Cita
  useEffect(() => {
    if (activeView === 'nueva-cita') {
      setSidebarCollapsed(true);
    }
  }, [activeView]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (view: string): void => {
    if (isValidView(view)) setActiveView(view);
  };

  const handleSelectDay = (date: string) => {
    setSelectedDay(date);
    setActiveView('citas-dia');
  };

  const renderView = (): ReactNode => {
    const viewProps = {
      onNavigate: handleNavigate,
      onCollapseSidebar: () => setSidebarCollapsed(true),
    };
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage {...viewProps} onSelectDay={handleSelectDay} />;
      case 'nueva-cita':
        return <NewAppointmentPage {...viewProps} />;
      case 'gestion-citas':
        return <AppointmentListPage {...viewProps} />;
      case 'procedimientos':
        return <ProcedureListPage {...viewProps} />;
      case 'usuarios':
        return isAdmin ? <UserListPage {...viewProps} /> : <DashboardPage {...viewProps} />;
      case 'citas-dia':
        return <DayAppointmentsPage date={selectedDay} onNavigate={handleNavigate} />;
      case 'historial-medico':
        return <MedicalHistoryPage onNavigate={handleNavigate} />;
      default:
        return <DashboardPage {...viewProps} />;
    }
  };

  return (
    <AppLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      userName={user?.nombre || ''}
      userRole={user?.rol || ''}
      isAdmin={isAdmin}
      viewTitle={VIEW_TITLES[activeView]}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
    >
      {renderView()}
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
