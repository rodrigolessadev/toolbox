import React from 'react';

export interface EmptyStateProps {
  /** Ícone (emoji ou elemento) */
  icon?: React.ReactNode;
  /** Título da mensagem */
  title: string;
  /** Descrição do estado vazio */
  description?: string;
  /** Ação primária (botão ou link) */
  action?: React.ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * EmptyState — Componente para estados vazios
 * 
 * @example
 * <EmptyState
 *   icon="📭"
 *   title="Nenhum resultado encontrado"
 *   description="Tente usar palavras-chave diferentes"
 *   action={<Button onClick={handleReset}>Limpar filtros</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className || ''}`}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="empty-state__title">{title}</h2>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
