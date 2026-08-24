/**
 * Plugin UI Components
 * Componentes reutilizáveis para interfaces de plugins
 * 
 * Base Components:
 * - Button — Botão com variantes
 * - Input — Input de texto
 * - Label — Label acessível
 * - Textarea — Área de texto
 * - Select — Dropdown
 * - Checkbox — Checkbox com label
 * - Radio — Radio button com label
 * - FormGroup — Grupo de formulário com label, erro e ajuda
 * 
 * Composite Components:
 * - PluginHeader — Cabeçalho de plugin
 * - PluginCard — Card de plugin
 * - ValidationMessage — Mensagens de validação
 * - EmptyState — Estado vazio
 * - LoadingSpinner — Indicador de carregamento
 * - CopyButton — Botão de copiar
 * - ResultArea — Área de resultado
 */

// Base Components
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Label, type LabelProps } from './Label';
export { Textarea, type TextareaProps } from './Textarea';
export { Select, type SelectProps } from './Select';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Radio, type RadioProps } from './Radio';
export { FormGroup, type FormGroupProps } from './FormGroup';

// Composite Components
export { PluginHeader, type PluginHeaderProps } from './PluginHeader';
export { PluginCard, type PluginCardProps } from './PluginCard';
export { ValidationMessage, type ValidationMessageProps } from './ValidationMessage';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { LoadingSpinner, type LoadingSpinnerProps } from './LoadingSpinner';
export { CopyButton, type CopyButtonProps } from './CopyButton';
export { ResultArea, type ResultAreaProps } from './ResultArea';

// Existing Components (for reference)
export { CommandInput } from './CommandInput';
export { CommandItem } from './CommandItem';
export { CommandList } from './CommandList';
export { Toast } from './Toast';
export { TitleBar } from './TitleBar';
export { Toolbox } from './Toolbox';
export { StractJsonModal } from './StractJsonModal';
export { ConverterDataModal } from './ConverterDataModal';
export { GeradorMarcacoesModal } from './GeradorMarcacoesModal';
export { GeradorAfdModal } from './GeradorAfdModal';
export { FeedbackModal } from './FeedbackModal';
