import { useCallback, useEffect, useState } from "react";
import { api, HistoryEntry } from "../lib/api";

export interface ToastItem {
  id: number;
  message: string;
  kind: "info" | "success" | "error" | "warning";
}

let toastId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastItem["kind"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, push, dismiss };
}

export function useHistory() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
