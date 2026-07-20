import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import type { CommandEntry } from "../lib/api";

export function useCommands() {
  const [commands, setCommands] = useState<Record<string, CommandEntry>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCommandsFile();
      setCommands(data?.commands ?? {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setCommands({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { commands, loading, error, reload };
}