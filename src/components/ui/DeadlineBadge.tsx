import { getDeadlineStatus } from "@/lib/content/articles";
import type { DeadlineStatus } from "@/lib/content/articles";

/**
 * RULE 39: Deadline intelligence — visual status badges.
 * RULE 40: Expired content strategy — clearly labeled.
 */

const STYLES: Record<DeadlineStatus, string> = {
  closing_soon: "bg-red-100 text-red-700 border-red-200",
  active: "bg-green-100 text-green-700 border-green-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
};

const LABELS: Record<DeadlineStatus, string> = {
  closing_soon: "শেষ সময় কাছে",
  active: "চলমান",
  expired: "মেয়াদ শেষ",
};

export function DeadlineBadge({ deadline }: { deadline: string }) {
  const status = getDeadlineStatus(deadline);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
      aria-label={`আবেদনের সময়সীমা: ${LABELS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
