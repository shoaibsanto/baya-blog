import Link from "next/link";
import { HUBS, SITE } from "@/config/site.config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-extrabold text-brand-dark">{SITE.name}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{SITE.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">বিভাগসমূহ</p>
            <ul className="mt-2 space-y-1.5">
              {HUBS.map((hub) => (
                <li key={hub.slug}>
                  <Link href={`/${hub.slug}`} className="text-sm text-muted hover:text-brand-dark">
                    {hub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">অন্যান্য</p>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/search" className="text-sm text-muted hover:text-brand-dark">
                  খুঁজুন
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className="text-sm text-muted hover:text-brand-dark">
                  সাইটম্যাপ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name} — এই ওয়েবসাইটের তথ্য শুধুমাত্র সহায়ক উদ্দেশ্যে; চূড়ান্ত
          সিদ্ধান্তের জন্য সংশ্লিষ্ট সরকারি ওয়েবসাইট দেখুন।
        </p>
      </div>
    </footer>
  );
}
