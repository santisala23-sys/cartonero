"use client";

interface AdvanceMonthButtonProps {
  onClick: () => void;
  disabled?: boolean;
  blockedByEvent?: boolean;
}

export function AdvanceMonthButton({
  onClick,
  disabled,
  blockedByEvent,
}: AdvanceMonthButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="advance-btn"
      >
        Avanzar trimestre
      </button>
      {blockedByEvent ? (
        <p className="text-center text-xs text-stone-500">
          Resolvé el evento antes de seguir.
        </p>
      ) : null}
    </div>
  );
}
