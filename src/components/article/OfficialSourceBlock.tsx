import type { OfficialSource } from "@/types";

export function OfficialSourceBlock({ source }: { source: OfficialSource }) {
  return (
    <div className="my-6 flex items-start gap-3 rounded-md border border-brand/30 bg-brand-light p-4">
      <span aria-hidden="true" className="text-lg leading-none text-brand-dark">
        ✓
      </span>
      <p className="text-sm text-brand-dark">
        <span className="font-semibold">সরকারি সূত্র: </span>
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {source.name}
        </a>
      </p>
    </div>
  );
}
