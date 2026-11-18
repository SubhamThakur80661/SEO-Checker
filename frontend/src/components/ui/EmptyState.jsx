export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {Icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-wash text-muted">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      ) : null}
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
