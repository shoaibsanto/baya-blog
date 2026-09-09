import { toBnNumber } from "@/lib/format";
import type { JobPosition } from "@/types";

export function PositionsTable({ positions }: { positions: JobPosition[] }) {
  const hasQualification = positions.some((p) => p.qualification);

  return (
    <div className="my-5 overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-surface">
            <th scope="col" className="border-b border-border px-4 py-2 text-left font-semibold">
              ক্রমিক
            </th>
            <th scope="col" className="border-b border-border px-4 py-2 text-left font-semibold">
              পদের নাম
            </th>
            <th scope="col" className="border-b border-border px-4 py-2 text-left font-semibold">
              পদসংখ্যা
            </th>
            {hasQualification && (
              <th scope="col" className="border-b border-border px-4 py-2 text-left font-semibold">
                শিক্ষাগত যোগ্যতা
              </th>
            )}
            <th scope="col" className="border-b border-border px-4 py-2 text-left font-semibold">
              বেতনস্কেল
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p, i) => (
            <tr key={p.name} className="border-b border-border last:border-b-0">
              <td className="px-4 py-2.5">{toBnNumber(i + 1)}</td>
              <td className="px-4 py-2.5 font-medium text-foreground">{p.name}</td>
              <td className="px-4 py-2.5">{p.vacancy}</td>
              {hasQualification && <td className="px-4 py-2.5">{p.qualification}</td>}
              <td className="px-4 py-2.5">{p.salary ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
