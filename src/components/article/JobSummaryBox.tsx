import { formatBnDate, daysRemaining, toBnNumber } from "@/lib/format";
import type { JobCircularMeta } from "@/types";

export function JobSummaryBox({ job }: { job: JobCircularMeta }) {
  const remaining = daysRemaining(job.deadline);

  const stats = [
    { label: "পদের ক্যাটাগরি", value: toBnNumber(job.positionCategoryCount) },
    { label: "মোট পদসংখ্যা", value: toBnNumber(job.totalVacancy) },
  ];

  return (
    <div className="my-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-background p-4">
          <p className="text-xs text-muted">{s.label}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{s.value}</p>
        </div>
      ))}
      <div className="bg-background p-4">
        <p className="text-xs text-muted">আবেদনের শেষ তারিখ</p>
        <p className="mt-1 text-lg font-bold text-foreground">{formatBnDate(job.deadline)}</p>
        {remaining && <p className="mt-0.5 text-xs font-medium text-accent">{remaining}</p>}
        {!remaining && <p className="mt-0.5 text-xs font-medium text-danger">আবেদনের সময় শেষ</p>}
      </div>
    </div>
  );
}
