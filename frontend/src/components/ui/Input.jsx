import { forwardRef } from "react";

/**
 * Labelled input. Always renders a visible <label> (never placeholder-only),
 * with error text next to the field.
 */
const Input = forwardRef(function Input(
  { id, label, error, hint, className = "", ...props },
  ref
) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={`h-11 w-full rounded-lg border bg-surface px-3.5 text-[15px] text-ink placeholder:text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-wash disabled:text-faint ${
          error ? "border-critical" : "border-line-strong"
        }`}
        {...props}
      />
      {hint && !error ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-[13px] text-critical">{error}</p> : null}
    </div>
  );
});

export default Input;
