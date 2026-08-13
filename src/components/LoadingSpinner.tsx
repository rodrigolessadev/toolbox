export interface LoadingSpinnerProps {
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Mensagem de carregamento */
  message?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * LoadingSpinner — Indicador de carregamento
 * 
 * @example
 * <LoadingSpinner size="md" message="Processando..." />
 */
export function LoadingSpinner({
  size = 'md',
  message,
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner loading-spinner--${size} ${className || ''}`}>
      <div className="loading-spinner__spinner" aria-hidden="true">
        ⟳
      </div>
      {message && (
        <p className="loading-spinner__message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
