import { useState, type FormEvent } from 'react';
import { FaPaw, FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight delay for realism
    await new Promise((r) => setTimeout(r, 500));

    const result = login(username, password);
    if (!result.success) {
      setError(result.error || 'Credenciales inválidas');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <FaPaw />
          </div>
          <h1 className={styles.title}>VetCare</h1>
          <p className={styles.subtitle}>Sistema de Gestión Veterinaria</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaUser /> Nombre de Usuario
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaLock /> Contraseña
            </label>
            <input
              type="password"
              className={styles.input}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            <FaSignInAlt />{' '}
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div className={styles.hint}>
            <p>
              <strong>Demo:</strong> admin / admin123 • secre1 / secre123
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
