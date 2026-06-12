import styles from './FormSuccess.module.css';

interface FormSuccessProps {
  message: string | null;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return <div className={styles['form-success']}>{message}</div>;
}
