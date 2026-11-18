export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`print-card rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,18,16,0.05)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 pt-5 pb-1 ${className}`}>
      <div>
        {title ? (
          <h3 className="font-display text-[17px] font-semibold leading-snug text-ink">{title}</h3>
        ) : null}
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export default Card;
