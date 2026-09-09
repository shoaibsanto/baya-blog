const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBnNumber(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export function formatBnDate(iso: string): string {
  const d = new Date(iso);
  const day = toBnNumber(d.getDate());
  const month = BN_MONTHS[d.getMonth()];
  const year = toBnNumber(d.getFullYear());
  return `${day} ${month}, ${year}`;
}

/** Days remaining until an ISO deadline, as a short Bengali label. Returns null once the deadline has passed. */
export function daysRemaining(iso: string): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(iso);
  deadline.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - today.getTime();
  const days = Math.round(diffMs / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return "আজই শেষ দিন";
  return `${toBnNumber(days)} দিন বাকি`;
}
