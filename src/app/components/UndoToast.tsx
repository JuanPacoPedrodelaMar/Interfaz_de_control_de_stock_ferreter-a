import { useEffect, useRef, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { UNDO_DURATION } from "../hooks/useUndoAction";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

/**
 * Toast de deshacer no intrusivo — aparece en la esquina inferior izquierda
 * para no interferir con las notificaciones Sonner del lado superior derecho.
 *
 * Incluye:
 * - Mensaje descriptivo de la acción realizada
 * - Botón "Deshacer" para revertir la acción
 * - Botón "×" para cerrar rápidamente
 * - Barra de progreso que muestra el tiempo restante
 * - Soporte de teclado: Ctrl+Z / Cmd+Z
 *
 * Heurísticas de Nielsen que mejora:
 * H1 – Visibilidad del estado: la barra de progreso muestra el tiempo restante
 * H3 – Control y libertad: permite deshacer cualquier acción destructiva o de mutación
 * H7 – Flexibilidad: atajo de teclado Ctrl+Z para usuarios avanzados
 */
export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  // Anima la barra de progreso usando requestAnimationFrame para suavidad
  useEffect(() => {
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Atajo de teclado: Ctrl+Z / Cmd+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        onUndo();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onUndo]);

  return (
    <div
      className="fixed bottom-5 left-5 z-50 w-[300px] rounded-lg shadow-lg border border-border bg-card text-card-foreground overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <RotateCcw
          className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-sm flex-1 text-foreground leading-snug truncate">
          {message}
        </span>
        <button
          onClick={onUndo}
          className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline shrink-0 px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
          aria-label="Deshacer acción (Ctrl+Z)"
        >
          Deshacer
        </button>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Barra de tiempo — H1: Visibilidad del estado del sistema */}
      <div className="h-[3px] bg-muted" aria-hidden="true">
        <div
          className="h-full bg-primary"
          style={{ width: `${progress}%`, transition: "none" }}
        />
      </div>
    </div>
  );
}