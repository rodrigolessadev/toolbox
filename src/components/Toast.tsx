import { ToastItem } from "../hooks/useToast";

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function Toast({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`} onClick={() => onDismiss(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
