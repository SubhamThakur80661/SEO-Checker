import { forwardRef } from "react";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 active:bg-lime-900 disabled:bg-line disabled:text-faint",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink-soft hover:bg-wash disabled:text-faint",
  ghost: "text-ink-soft hover:bg-wash hover:text-ink disabled:text-faint",
  danger: "bg-critical text-white hover:bg-red-800 disabled:bg-line disabled:text-faint",
  acid: "bg-acid text-ink hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-300/60 disabled:bg-line disabled:text-faint",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-[15px]",
  lg: "h-12 px-5 text-base",
};

/**
 * shadcn-idiom button. Always a real <button>, min 44px touch target on
 * md/lg, visible focus ring from the global :focus-visible rule.
 */
const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});

export default Button;
