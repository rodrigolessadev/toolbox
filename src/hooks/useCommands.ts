import { useCallback, useEffect, useState } from "react";
import { api, CommandEntry, CommandsMap } from "../lib/api";

/**
 * Hook para carregar e manipular comandos.
 * Refetch pode ser disparado manualmente após criar/editar/excluir.
 */
export function useCommands() {
  const [commands, setCommands] = useState<[string, CommandEntry][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCommands();
      const [commands, setCommands] = useState<CommandsMap>({});

      const load = useCallback(async () => {
        const data = await api.listCommands();
        setCommands(data);
      }, []);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { commands, loading, error, refresh };
}
