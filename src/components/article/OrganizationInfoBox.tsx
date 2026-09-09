import type { OrganizationInfo } from "@/types";

export function OrganizationInfoBox({ org }: { org: OrganizationInfo }) {
  const rows: [string, string][] = [];
  if (org.website) rows.push(["অফিশিয়াল ওয়েবসাইট", org.website]);
  if (org.address) rows.push(["ঠিকানা", org.address]);
  if (org.phone) rows.push(["ফোন নম্বর", org.phone]);
  if (org.email) rows.push(["ই-মেইল", org.email]);

  if (rows.length === 0) return null;

  return (
    <div className="my-5 overflow-hidden rounded-md border border-border">
      <table className="w-full border-collapse text-sm">
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
