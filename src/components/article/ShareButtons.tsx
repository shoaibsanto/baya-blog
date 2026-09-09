"use client";

import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      icon: "📘",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      icon: "🟢",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "X",
      icon: "✕",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Messenger",
      icon: "💬",
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=&redirect_uri=${encodedUrl}`,
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op, link stays selectable manually
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="পোস্টটি শেয়ার করুন">
      <span className="text-sm font-semibold text-foreground">শেয়ার করুন:</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.label}-এ শেয়ার করুন`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-base hover:border-brand"
        >
          <span aria-hidden="true">{link.icon}</span>
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground hover:border-brand"
      >
        <span aria-hidden="true">🔗</span>
        {copied ? "কপি হয়েছে" : "লিংক কপি করুন"}
      </button>
    </div>
  );
}
