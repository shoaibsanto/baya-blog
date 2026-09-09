"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/config/site.config";

const PRIMARY_NAV = CATEGORIES.slice(0, 4);

export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-extrabold">
          <span className="text-foreground">BAYA</span> <span className="text-brand">Blog</span>
        </Link>

        <nav aria-label="প্রধান মেনু" className="hidden items-center gap-5 md:flex">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-brand-dark">
            আজকের চাকরি
          </Link>
          {PRIMARY_NAV.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="text-sm font-medium text-foreground hover:text-brand-dark"
            >
              {cat.shortName}
            </Link>
          ))}
        </nav>

        <form action="/search" onSubmit={handleSearch} className="hidden max-w-xs flex-1 items-center md:flex">
          <label htmlFor="site-search" className="sr-only">
            চাকরি খুঁজুন
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="চাকরি খুঁজুন..."
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </form>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="খুঁজুন"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:border-brand md:hidden"
          >
            <span aria-hidden="true">🔍</span>
          </Link>
          <button
            type="button"
            aria-label="মেনু খুলুন"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="মোবাইল মেনু" className="border-t border-border md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <li>
              <Link href="/" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-foreground">
                আজকের চাকরি
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
