import React from 'react';

export interface PluginCardProps {
  /** ID único do plugin */
  id: string;
  /** Nome do plugin */
  name: string;
  /** Ícone do plugin */
  icon?: React.ReactNode;
  /** Versão do plugin */
  version?: string;
  /** Descrição breve */
  description?: string;
  /** Se está selecionado */
  selected?: boolean;
  /** Se está ativo */
  active?: boolean;
  /** Callback ao clicar */
  onClick?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * PluginCard — Card reutilizável para exibir plugins
 * 
 * @example
 * <PluginCard
 *   id="gerador-json"
 *   name="Gerador de JSON"
 *   icon="📄"
 *   version="1.0.0"
 *   description="Converte dados em JSON"
 *   selected={selectedId === 'gerador-json'}
 *   onClick={() => setSelectedId('gerador-json')}
 * />
 */
export function PluginCard({
  name,
  icon,
  version,
  description,
  selected,
  active,
  onClick,
  className,
}: PluginCardProps) {
  const classes = [
    'plugin-card',
    selected && 'plugin-card--selected',
    active && 'plugin-card--active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-pressed={selected}
    >
      {icon && (
        <div className="plugin-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="plugin-card__content">
        <h3 className="plugin-card__name">{name}</h3>
        {version && (
          <span className="plugin-card__version">v{version}</span>
        )}
        {description && (
          <p className="plugin-card__description">{description}</p>
        )}
      </div>
      {active && (
        <span className="plugin-card__badge" aria-label="Ativo">
          ✓
        </span>
      )}
    </div>
  );
}
