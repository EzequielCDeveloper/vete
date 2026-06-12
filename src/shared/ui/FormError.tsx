import styles from './FormError.module.css';

interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return <div className={styles['form-error']}>{message}</div>;
}
