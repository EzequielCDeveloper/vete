import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '2rem',
          fontFamily: 'Inter, sans-serif', color: '#1F2937', background: '#F0F2F5'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Algo salió mal</h1>
          <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Ocurrió un error inesperado. Intente recargar la página.</p>
          <button onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem', background: '#4A90D9', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer'
            }}>
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
