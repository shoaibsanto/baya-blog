import { formatBnDate } from "@/lib/format";
import type { Author } from "@/types";

export function ArticleMeta({
  author,
  updatedAt,
  lastVerifiedAt,
}: {
  author: Author;
  updatedAt: string;
  lastVerifiedAt?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span>লেখক: {author.name}</span>
      <span aria-hidden="true">•</span>
      <span>সর্বশেষ আপডেট: {formatBnDate(updatedAt)}</span>
      {lastVerifiedAt && (
        <>
          <span aria-hidden="true">•</span>
          <span>তথ্য যাচাই: {formatBnDate(lastVerifiedAt)}</span>
        </>
      )}
    </div>
  );
}
