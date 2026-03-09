import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface ParsedCandidate {
  name: string;
  age?: number;
  dob?: string;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n");
}

const DATE_PATTERNS = [
  /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g,
  /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g,
  /\b(?:DOB|Date of Birth|Born)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
];

const AGE_PATTERNS = [
  /\b(?:Age|AGE)[:\s]+(\d{1,3})\b/gi,
  /\b(\d{1,3})\s*years?\s*old\b/gi,
  /\b(\d{1,3})\s*y(?:ears?)?\b/gi,
];

const NAME_PATTERNS = [
  /\b(?:Name|NAME|Candidate)[:\s]+([A-Za-z][A-Za-z\s\.\-]{2,50})\b/,
  /^([A-Za-z][A-Za-z\s\.\-]{2,50})$/m,
  /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
];

function extractFirstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1].trim();
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  for (const p of DATE_PATTERNS) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return undefined;
}

function extractAge(text: string): number | undefined {
  for (const p of AGE_PATTERNS) {
    const m = text.match(p);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if (n >= 18 && n <= 120) return n;
    }
  }
  return undefined;
}

function extractName(text: string): string | undefined {
  return extractFirstMatch(text, NAME_PATTERNS);
}

export function parseCandidateFromText(text: string): ParsedCandidate {
  const result: ParsedCandidate = { name: "" };
  const name = extractName(text);
  if (name) result.name = name;
  const dob = extractDate(text);
  if (dob) result.dob = dob;
  const age = extractAge(text);
  if (age) result.age = age;
  return result;
}
