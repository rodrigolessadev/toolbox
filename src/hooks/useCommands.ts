import { useCallback, useEffect, useState } from "react";
import { api, CommandEntry, CommandsMap } from "../lib/api";

export function useCommands() {
  const [commands, setCommands] = useState<CommandsMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listCommands();
      setCommands(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { commands, loading, error, reload };
}