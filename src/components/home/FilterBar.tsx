import { CATEGORIES, QUALIFICATIONS } from "@/config/site.config";
import { DEADLINE_OPTIONS } from "@/lib/jobFilters";

export function FilterBar({
  defaultCategory,
  defaultQualification,
  defaultDeadline,
}: {
  defaultCategory?: string;
  defaultQualification?: string;
  defaultDeadline?: string;
}) {
  return (
    <form
      action="/"
      method="get"
      className="grid gap-2 rounded-md border border-border bg-surface p-3 sm:grid-cols-4"
      aria-label="চাকরি ফিল্টার করুন"
    >
      <div>
        <label htmlFor="filter-category" className="sr-only">
          ক্যাটাগরি
        </label>
        <select
          id="filter-category"
          name="category"
          defaultValue={defaultCategory ?? ""}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">সকল ক্যাটাগরি</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-qualification" className="sr-only">
          শিক্ষাগত যোগ্যতা
        </label>
        <select
          id="filter-qualification"
          name="qualification"
          defaultValue={defaultQualification ?? ""}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">সকল শিক্ষাগত যোগ্যতা</option>
          {QUALIFICATIONS.map((q) => (
            <option key={q.value} value={q.value}>
              {q.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-deadline" className="sr-only">
          সময়সীমা
        </label>
        <select
          id="filter-deadline"
          name="deadline"
          defaultValue={defaultDeadline ?? ""}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
        >
          {DEADLINE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        ফিল্টার করুন
      </button>
    </form>
  );
}
