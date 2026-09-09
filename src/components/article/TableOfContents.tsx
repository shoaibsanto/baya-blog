export function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: 2 | 3 }[];
}) {
  if (headings.length === 0) return null;
  return (
    <details className="my-5 rounded-md border border-border bg-surface p-4 open:pb-4" open>
      <summary className="cursor-pointer text-sm font-semibold text-foreground">সূচিপত্র</summary>
      <nav aria-label="সূচিপত্র" className="mt-3">
        <ul className="space-y-1.5 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
              <a href={`#${h.id}`} className="text-brand-dark hover:underline">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
