import type { ReactNode, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
      <div
        className={`${styles.modal} ${size !== 'md' ? styles[`modal--${size}`] : ''}`}
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className={styles['modal-header']}>
          <h3>{title}</h3>
          <button className={styles['modal-close']} onClick={onClose} type="button">
            &times;
          </button>
        </div>
        <div className={styles['modal-body']}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
