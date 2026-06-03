import { useCallback, useState } from "react";

export interface UndoAction {
  message: string;
  undo: () => void;
  redo: () => void;
}

/**
 * Hook para gestionar historial de deshacer/rehacer.
 *
 * Retorna:
 * - `canUndo`: boolean si hay acciones para deshacer
 * - `canRedo`: boolean si hay acciones para rehacer
 * - `pushAction(action)`: añade una nueva acción al historial
 * - `undo()`: deshace la última acción
 * - `redo()`: rehace la última acción deshecha
 */
export function useUndoAction() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const pushAction = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;

      const lastAction = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);

      lastAction.undo();
      setRedoStack((redoPrev) => [...redoPrev, lastAction]);

      return newStack;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;

      const lastAction = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);

      lastAction.redo();
      setUndoStack((undoPrev) => [...undoPrev, lastAction]);

      return newStack;
    });
  }, []);

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    pushAction,
    undo,
    redo,
  };
}
