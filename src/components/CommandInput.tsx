import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onEscape?: () => void;
  onArrowDown?: () => void;
  onArrowUp?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommandInput({
  value,
  onChange,
  onSubmit,
  onEscape,
  onArrowDown,
  onArrowUp,
  placeholder,
  autoFocus,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className="command-input">
      <span className="command-input__icon">⚡</span>
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder ?? "Digite um comando e pressione Enter…"}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          } else if (e.key === "Escape") {
            onEscape?.();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onArrowDown?.();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onArrowUp?.();
          }
        }}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
