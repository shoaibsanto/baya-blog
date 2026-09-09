export function InfoTable({
  headers,
  rows,
  caption,
}: {
  headers: string[];
  rows: string[][];
  caption?: string;
}) {
  return (
    <div className="my-5 overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        {caption && (
          <caption className="border-b border-border bg-surface px-4 py-2 text-left text-xs text-muted">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="bg-surface">
            {headers.map((h) => (
              <th key={h} scope="col" className="border-b border-border px-4 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
