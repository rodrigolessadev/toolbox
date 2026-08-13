import React from 'react';

export interface PluginHeaderProps {
  /** Nome do plugin */
  name: string;
  /** Versão do plugin */
  version: string;
  /** Ícone (emoji ou elemento React) */
  icon?: React.ReactNode;
  /** Autor do plugin */
  author?: string;
  /** Callback para fechar */
  onClose?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * PluginHeader — Cabeçalho reutilizável para plugins
 * 
 * @example
 * <PluginHeader
 *   name="Gerador de JSON"
 *   version="1.0.0"
 *   icon="📄"
 *   author="João Silva"
 *   onClose={handleClose}
 * />
 */
export function PluginHeader({
  name,
  version,
  icon,
  author,
  onClose,
  className,
}: PluginHeaderProps) {
  return (
    <header className={`plugin-header ${className || ''}`}>
      <div className="plugin-header__content">
        {icon && (
          <div className="plugin-header__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="plugin-header__info">
          <h1 className="plugin-header__name">{name}</h1>
          <div className="plugin-header__meta">
            <span className="plugin-header__version">v{version}</span>
            {author && (
              <span className="plugin-header__author">por {author}</span>
            )}
          </div>
        </div>
      </div>
      {onClose && (
        <button
          className="plugin-header__close"
          onClick={onClose}
          aria-label="Fechar"
          title="Fechar"
        >
          ✕
        </button>
      )}
    </header>
  );
}
