import { useCallback, useRef, useState } from "react";

/** Duración del toast de deshacer en milisegundos */
export const UNDO_DURATION = 5000;

export interface UndoConfig {
  message: string;
  onUndo: () => void;
}

/**
 * Hook para gestionar la acción de deshacer (undo) con toast temporal.
 *
 * Retorna:
 * - `undoConfig`: configuración actual del toast (null si no hay acción pendiente)
 * - `showUndo(config)`: muestra el toast con la acción a deshacer
 * - `dismiss()`: cierra el toast sin ejecutar undo
 * - `executeUndo()`: ejecuta el undo y cierra el toast
 */
export function useUndoAction() {
  const [undoConfig, setUndoConfig] = useState<UndoConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showUndo = useCallback(
    (config: UndoConfig) => {
      clearTimer();
      setUndoConfig(config);
      timerRef.current = setTimeout(() => {
        setUndoConfig(null);
      }, UNDO_DURATION);
    },
    [clearTimer]
  );

  const dismiss = useCallback(() => {
    clearTimer();
    setUndoConfig(null);
  }, [clearTimer]);

  const executeUndo = useCallback(() => {
    clearTimer();
    setUndoConfig((prev) => {
      prev?.onUndo();
      return null;
    });
  }, [clearTimer]);

  return { undoConfig, showUndo, dismiss, executeUndo };
}
