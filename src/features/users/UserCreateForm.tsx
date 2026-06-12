import { useState, type FormEvent } from 'react';
import { FaUserPlus, FaPlus } from 'react-icons/fa';
import { userApi } from '../../data/services/apiService';
import { Card, FormError, FormSuccess } from '../../shared/ui';
import styles from './UserCreateForm.module.css';

interface UserCreateFormProps {
  onUserCreated: () => void;
}

export default function UserCreateForm({ onUserCreated }: UserCreateFormProps) {
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre.trim() || !username.trim() || !password || !rol) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSaving(true);

    try {
      const validRoles = ['administrador', 'secretario', 'veterinario'] as const;
      type ValidRole = typeof validRoles[number];

      if (!validRoles.includes(rol as ValidRole)) {
        throw new Error('Rol inválido');
      }

      await userApi.create({
        nombre: nombre.trim(),
        username: username.trim(),
        password,
        rol: rol as ValidRole,
      });

      setSuccess('Usuario creado exitosamente.');
      setNombre('');
      setUsername('');
      setPassword('');
      setRol('');
      onUserCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el usuario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card header={<h4><FaUserPlus /> Crear Nuevo Usuario</h4>}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Nombre completo <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Nombre de usuario <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: juanperez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Contraseña <span className="required">*</span>
            </label>
            <input
              type="password"
              placeholder="Mín. 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Rol <span className="required">*</span>
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
              <option value="">Seleccione un rol...</option>
              <option value="secretario">Secretario/a</option>
              <option value="veterinario">Veterinario/a</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <FaPlus /> {saving ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </Card>
  );
}
