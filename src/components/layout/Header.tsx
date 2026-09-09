"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { HUBS, SITE } from "@/config/site.config";

const PRIMARY_NAV = HUBS.slice(0, 6);

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/mark.png" alt="" width={32} height={32} priority className="h-8 w-8" />
          <span className="text-lg font-extrabold">
            <span className="text-foreground">BAYA</span> <span className="text-brand">Blog</span>
          </span>
        </Link>

        <nav aria-label="প্রধান মেনু" className="hidden items-center gap-5 md:flex">
          {PRIMARY_NAV.map((hub) => (
            <Link
              key={hub.slug}
              href={`/${hub.slug}`}
              className="text-sm font-medium text-foreground hover:text-brand-dark"
            >
              {hub.shortName}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="খুঁজুন"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:border-brand"
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
          <ul className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
            {HUBS.map((hub) => (
              <li key={hub.slug}>
                <Link
                  href={`/${hub.slug}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground"
                >
                  {hub.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
