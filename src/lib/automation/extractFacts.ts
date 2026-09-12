import * as cheerio from "cheerio";
import { parseBnDate } from "./bnDate";

const SUMMARY_LABEL_MAP: Record<string, string> = {
  "প্রতিষ্ঠানের নাম": "orgName",
  "জব লোকেশন": "jobLocation",
  "পদের ক্যাটাগরি": "positionCategoryCount",
  "মোট শূন্যপদ": "totalVacancy",
  "চাকরির ধরন": "jobTypeLabel",
  "বয়সসীমা": "ageLimit",
  "শিক্ষাগত যোগ্যতা": "educationRequirement",
  "বেতন": "salaryNote", // matches "বেতন/গ্রেড" via startsWith below
  "আবেদনের ফি": "applicationFee",
  "বিজ্ঞপ্তির সোর্স": "source",
  "স্মারক নম্বর": "memoNumber",
  "বিজ্ঞপ্তি জারির তারিখ": "noticeDateRaw",
  "বিজ্ঞপ্তি প্রকাশের তারিখ": "publishDateRaw",
  "আবেদনের শেষ তারিখ": "deadlineRaw",
  "আবেদন পদ্ধতি": "applicationMethod",
};

const ORG_LABEL_MAP: Record<string, string> = {
  "অফিশিয়াল ওয়েবসাইট": "website",
  "হেড অফিসের ঠিকানা": "address",
  "ঠিকানা": "address",
  "ফোন নাম্বার": "phone",
  "ফ্যাক্স নাম্বার": "fax",
  "ই-মেইল": "email",
};

function matchLabel(map: Record<string, string>, label: string): string | null {
  const exact = map[label];
  if (exact) return exact;
  const prefixMatch = Object.keys(map).find((k) => label.startsWith(k));
  return prefixMatch ? map[prefixMatch] : null;
}

// Strips trailing unit words ("টি", "জন") so the stored value is a bare count —
// matching how positionCategoryCount/totalVacancy are stored elsewhere in the schema;
// display components add their own "টি"/"জন" suffix.
function stripUnitSuffix(value: string | undefined): string | undefined {
  if (!value) return value;
  return value.replace(/\s*(টি|জন)\s*$/u, "").trim();
}

export interface ExtractedPosition {
  name: string;
  vacancy: string;
  salary?: string;
  qualification?: string;
}

export interface ExtractedFacts {
  organization: {
    name: string | null;
    website: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  jobLocation: string | null;
  positionCategoryCount: string | null;
  totalVacancy: string | null;
  educationRequirement: string | null;
  ageLimit: string | null;
  applicationFee: string | null;
  applicationMethod: string | null;
  source: string | null;
  memoNumber: string | null;
  noticeDate: string | null;
  publishDate: string | null;
  deadline: string | null;
  deadlineRawText: string | null;
  positions: ExtractedPosition[];
}

/**
 * Extracts structured facts from a bdgovtjob.net post's rendered HTML.
 * Pure fact extraction from their `<table class="jc-table">` key/value markup —
 * no prose/paragraphs are read or reused, only labelled data points and table rows.
 * Returns null fields for anything not found; the caller decides what's mandatory.
 */
export function extractFacts(html: string): ExtractedFacts {
  // The source HTML mixes NFC/NFD forms for some Bengali conjuncts (e.g. "অফিশিয়াল"),
  // which silently breaks exact-string label matching below unless both sides are
  // normalized to the same form.
  const $ = cheerio.load(html.normalize("NFC"));
  const summary: Record<string, string> = {};
  const org: Record<string, string> = {};

  $("table.jc-table tr").each((_, row) => {
    const $row = $(row);
    const label = $row.find("th").first().text().trim().normalize("NFC");
    const valueCell = $row.find("td").first();
    const value = valueCell.text().trim().normalize("NFC");
    if (!label || !value) return;

    const summaryKey = matchLabel(SUMMARY_LABEL_MAP, label);
    if (summaryKey) summary[summaryKey] = value;

    const orgKey = matchLabel(ORG_LABEL_MAP, label);
    if (orgKey) {
      if (orgKey === "website") {
        const href = valueCell.find("a").attr("href");
        org.website = href || value;
      } else {
        org[orgKey] = value;
      }
    }
  });

  const positions: ExtractedPosition[] = [];
  $("#post-details table.jc-table-full").each((_, table) => {
    const $table = $(table);
    const headers = $table
      .find("thead th")
      .map((_, th) => $(th).text().trim())
      .get();
    if (headers.length === 0) return;

    const nameIdx = headers.findIndex((h) => h.includes("পদের নাম"));
    const vacancyIdx = headers.findIndex((h) => h.includes("পদ সংখ্যা") || h.includes("পদসংখ্যা"));
    const salaryIdx = headers.findIndex((h) => h.includes("বেতন"));
    const qualificationIdx = headers.findIndex((h) => h.includes("যোগ্যতা"));
    if (nameIdx === -1) return;

    $table.find("tbody tr").each((_, tr) => {
      const cells = $(tr)
        .find("td")
        .map((_, td) => $(td).text().trim())
        .get();
      if (cells.length === 0 || !cells[nameIdx]) return;
      positions.push({
        name: cells[nameIdx],
        vacancy: vacancyIdx !== -1 ? cells[vacancyIdx] : "",
        salary: salaryIdx !== -1 ? cells[salaryIdx] : undefined,
        qualification: qualificationIdx !== -1 ? cells[qualificationIdx] : undefined,
      });
    });
  });

  return {
    organization: {
      name: summary.orgName ?? null,
      website: org.website ?? null,
      address: org.address ?? null,
      phone: org.phone ?? null,
      email: org.email ?? null,
    },
    jobLocation: summary.jobLocation ?? null,
    positionCategoryCount: stripUnitSuffix(summary.positionCategoryCount) ?? null,
    totalVacancy: stripUnitSuffix(summary.totalVacancy) ?? null,
    educationRequirement: summary.educationRequirement ?? null,
    ageLimit: summary.ageLimit ?? null,
    applicationFee: summary.applicationFee ?? null,
    applicationMethod: summary.applicationMethod ?? null,
    source: summary.source ?? null,
    memoNumber: summary.memoNumber ?? null,
    noticeDate: parseBnDate(summary.noticeDateRaw),
    publishDate: parseBnDate(summary.publishDateRaw),
    deadline: parseBnDate(summary.deadlineRaw),
    deadlineRawText: summary.deadlineRaw ?? null,
    positions,
  };
}
