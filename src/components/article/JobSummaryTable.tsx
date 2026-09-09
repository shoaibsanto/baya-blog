import { formatBnDate, toBnNumber } from "@/lib/format";
import { getCategory } from "@/config/site.config";
import type { Article } from "@/types";

export function JobSummaryTable({ article }: { article: Article }) {
  const job = article.job;
  if (!job) return null;
  const category = getCategory(article.category);

  const rows: [string, string][] = [
    ["প্রতিষ্ঠানের নাম", job.organization.name],
    ["জব লোকেশন", job.jobLocation],
    ["পদের ক্যাটাগরি", `${toBnNumber(job.positionCategoryCount)} টি`],
    ["মোট শূন্যপদ", `${toBnNumber(job.totalVacancy)} জন`],
    ["চাকরির ধরন", category?.name ?? job.jobType],
    ["শিক্ষাগত যোগ্যতা", job.educationRequirement],
  ];
  if (job.ageLimit) rows.push(["বয়সসীমা", job.ageLimit]);
  if (job.applicationFee) rows.push(["আবেদনের ফি", job.applicationFee]);
  if (job.source) rows.push(["বিজ্ঞপ্তির সোর্স", job.source]);
  if (job.noticeDate) rows.push(["বিজ্ঞপ্তি জারির তারিখ", formatBnDate(job.noticeDate)]);
  rows.push(["বিজ্ঞপ্তি প্রকাশের তারিখ", formatBnDate(job.publishDate)]);
  rows.push(["আবেদনের শেষ তারিখ", formatBnDate(job.deadline)]);
  rows.push(["আবেদন পদ্ধতি", job.applicationMethod]);

  return (
    <div className="my-5 overflow-hidden rounded-md border border-border">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">এক নজরে {job.organization.name} নিয়োগ বিজ্ঞপ্তির সারসংক্ষেপ</caption>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-border last:border-b-0 odd:bg-surface">
              <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-medium text-muted">
                {label}
              </th>
              <td className="px-4 py-2.5 text-foreground">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
