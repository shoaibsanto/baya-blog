export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="my-5 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[0.95rem] leading-7">
          <span aria-hidden="true" className="mt-1 text-success">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
