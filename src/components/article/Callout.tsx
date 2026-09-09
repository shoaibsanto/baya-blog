export function Callout({
  variant,
  title,
  children,
}: {
  variant: "info" | "warning" | "success";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-info bg-info-bg text-info",
    warning: "border-warning bg-warning-bg text-warning",
    success: "border-success bg-success-bg text-success",
  }[variant];

  const icon = { info: "ℹ", warning: "⚠", success: "✓" }[variant];

  return (
    <div className={`my-5 rounded-md border-l-4 p-4 ${styles}`} role="note">
      <div className="flex gap-2">
        <span aria-hidden="true" className="text-lg leading-none">
          {icon}
        </span>
        <div className="text-foreground">
          {title && <p className="mb-1 font-semibold">{title}</p>}
          <p className="text-[0.95rem] leading-7">{children}</p>
        </div>
      </div>
    </div>
  );
}
