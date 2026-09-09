import type { FAQItem } from "@/types";

export function FAQBlock({ items }: { items: FAQItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading" className="my-8">
      <h2 id="faq-heading" className="mb-4 text-xl font-bold text-foreground">
        সচরাচর জিজ্ঞাসা (FAQ)
      </h2>
      <div className="divide-y divide-border rounded-md border border-border">
        {items.map((item, i) => (
          <details key={i} className="group p-4">
            <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
              <span className="flex items-center justify-between gap-2">
                {item.question}
                <span aria-hidden="true" className="text-muted transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-[0.95rem] leading-7 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
