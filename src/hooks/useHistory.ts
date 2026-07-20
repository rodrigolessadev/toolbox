import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import type { HistoryEntry } from "../lib/api";

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listHistory();
      setHistory(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { history, loading, error, reload };
}