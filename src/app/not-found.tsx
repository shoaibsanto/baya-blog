import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/config/site.config";

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <p className="text-sm font-semibold text-brand-dark">৪০৪</p>
      <h1 className="mt-2 text-2xl font-extrabold text-foreground">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mt-2 text-sm text-muted">
        আপনি যে পাতাটি খুঁজছেন তা সরানো হয়েছে বা এটি বিদ্যমান নয়।
      </p>

      <form action="/search" className="mx-auto mt-6 flex max-w-sm items-center gap-2">
        <label htmlFor="q" className="sr-only">
          অনুসন্ধান করুন
        </label>
        <input
          id="q"
          name="q"
          type="search"
          placeholder="খুঁজে দেখুন..."
          className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="h-11 rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          খুঁজুন
        </button>
      </form>

      <div className="mt-8">
        <p className="text-sm font-semibold text-foreground">জনপ্রিয় ক্যাটাগরি</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-brand"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand-dark hover:underline">
        ← হোমপেজে ফিরুন
      </Link>
    </Container>
  );
}
