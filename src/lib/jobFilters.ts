import type { Article } from "@/types";

export type DeadlineWindow = "today" | "3_days" | "7_days" | "15_days" | "30_days" | "active";

export const DEADLINE_OPTIONS: { value: DeadlineWindow | ""; label: string }[] = [
  { value: "", label: "যে কোনো সময়সীমা" },
  { value: "today", label: "আজ" },
  { value: "3_days", label: "আগামী ৩ দিনের মধ্যে" },
  { value: "7_days", label: "আগামী ৭ দিনের মধ্যে" },
  { value: "15_days", label: "আগামী ১৫ দিনের মধ্যে" },
  { value: "30_days", label: "আগামী ৩০ দিনের মধ্যে" },
  { value: "active", label: "চলমান ডেডলাইন (আবেদনের সময় আছে)" },
];

const WINDOW_DAYS: Record<Exclude<DeadlineWindow, "today" | "active">, number> = {
  "3_days": 3,
  "7_days": 7,
  "15_days": 15,
  "30_days": 30,
};

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(iso);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
}

export function matchesDeadlineWindow(deadlineIso: string, windowValue: DeadlineWindow): boolean {
  const diff = daysUntil(deadlineIso);
  if (windowValue === "today") return diff === 0;
  if (windowValue === "active") return diff >= 0;
  return diff >= 0 && diff <= WINDOW_DAYS[windowValue];
}

export interface JobFilters {
  category?: string;
  qualification?: string;
  deadline?: string;
}

export function filterArticles(articles: Article[], filters: JobFilters): Article[] {
  return articles.filter((a) => {
    if (filters.category) {
      const inCategory =
        a.category === filters.category || a.additionalCategories?.includes(filters.category as never);
      if (!inCategory) return false;
    }
    if (filters.qualification) {
      if (!a.job?.qualificationLevels?.includes(filters.qualification)) return false;
    }
    if (filters.deadline && a.job) {
      if (!matchesDeadlineWindow(a.job.deadline, filters.deadline as DeadlineWindow)) return false;
    }
    return true;
  });
}
