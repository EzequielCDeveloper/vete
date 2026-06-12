import { useState, useEffect, useCallback } from 'react';
import { FaUsersCog, FaTrash, FaUsers, FaKey } from 'react-icons/fa';
import { userApi } from '../../data/services/apiService';
import type { User } from '../../data/services/apiService';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Breadcrumbs } from '../../shared/ui';
import UserCreateForm from './UserCreateForm';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PasswordChangeModal } from './PasswordChangeModal';
import styles from './UserListPage.module.css';

interface UserListPageProps {
  onNavigate?: (view: string) => void;
}

function getRolBadgeVariant(rol: string) {
  switch (rol) {
    case 'administrador': return 'admin';
    case 'secretario': return 'secretario';
    case 'veterinario': return 'veterinario';
    default: return 'info';
  }
}

export default function UserListPage({ onNavigate }: UserListPageProps) {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Only admin can see this page
  if (!isAdmin) {
    return null;
  }

  const handleDeleteClick = (targetUser: User) => {
    setDeleteId(targetUser.id);
    setDeleteName(targetUser.nombre);
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Usuarios' },
        ]}
        onNavigate={onNavigate}
      />
      <div className={styles.viewHeader}>
        <h3>
          <FaUsersCog className={styles.headerIcon} /> Gestión de Usuarios
        </h3>
        <p className={styles.viewDesc}>Administre las cuentas de usuario del sistema.</p>
      </div>

      <UserCreateForm onUserCreated={loadUsers} />

      <Card header={<h4><FaUsers /> Usuarios Registrados</h4>}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.nombre}</td>
                    <td>
                      <Badge variant={getRolBadgeVariant(u.rol)}>
                        {u.rol}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button
                          className={styles.btnAction}
                          onClick={() => setResetPwdUser(u)}
                        >
                          <FaKey /> Restablecer
                        </button>
                        {user?.id !== u.id && (
                          <button
                            className={styles.btnActionDanger}
                            onClick={() => handleDeleteClick(u)}
                          >
                            <FaTrash /> Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <DeleteConfirmModal
        userId={deleteId}
        userName={deleteName}
        onClose={() => setDeleteId(null)}
        onDeleted={() => {
          loadUsers();
          setDeleteId(null);
        }}
      />

      <PasswordChangeModal
        isOpen={!!resetPwdUser}
        onClose={() => setResetPwdUser(null)}
        mode="admin"
        targetUserId={resetPwdUser?.id}
        targetUserName={resetPwdUser?.nombre}
        onChanged={loadUsers}
      />
    </div>
  );
}
