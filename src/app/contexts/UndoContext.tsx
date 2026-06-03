import React, { createContext, useContext } from "react";
import { useUndoAction, UndoAction } from "../hooks/useUndoAction";

interface UndoContextType {
  canUndo: boolean;
  canRedo: boolean;
  pushAction: (action: UndoAction) => void;
  undo: () => void;
  redo: () => void;
}

const UndoContext = createContext<UndoContextType | null>(null);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const { canUndo, canRedo, pushAction, undo, redo } = useUndoAction();

  return (
    <UndoContext.Provider
      value={{
        canUndo,
        canRedo,
        pushAction,
        undo,
        redo,
      }}
    >
      {children}
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error("useUndo must be used within UndoProvider");
  return ctx;
}
