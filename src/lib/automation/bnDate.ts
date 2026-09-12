const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function bnToLatinDigits(str: string): string {
  return str.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

const MONTHS: Record<string, number> = {
  "জানুয়ারি": 1,
  "ফেব্রুয়ারি": 2,
  "মার্চ": 3,
  "এপ্রিল": 4,
  "মে": 5,
  "জুন": 6,
  "জুলাই": 7,
  "আগস্ট": 8,
  "সেপ্টেম্বর": 9,
  "অক্টোবর": 10,
  "নভেম্বর": 11,
  "ডিসেম্বর": 12,
};

/**
 * Parses a single Bengali date like "০৮ অক্টোবর ২০২৬" into an ISO "2026-10-08" string.
 * Returns null if it can't confidently parse (e.g. multi-date strings like
 * "১০, ১৫, ২৩ সেপ্টেম্বর" — those need editorial attention, not a guess).
 */
export function parseBnDate(text: string | undefined | null): string | null {
  if (!text) return null;
  const latin = bnToLatinDigits(text.trim());
  const monthName = Object.keys(MONTHS).find((m) => text.includes(m));
  if (!monthName) return null;
  const dayMatch = latin.match(/\b(\d{1,2})\b/);
  const yearMatch = latin.match(/\b(20\d{2})\b/);
  if (!dayMatch || !yearMatch) return null;
  const day = String(dayMatch[1]).padStart(2, "0");
  const month = String(MONTHS[monthName]).padStart(2, "0");
  return `${yearMatch[1]}-${month}-${day}`;
}
