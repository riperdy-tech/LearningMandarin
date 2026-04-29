"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type PrintableSheet = {
  body: string;
  meta: string;
  note: string;
  title: string;
};

const PRINT_SHEET_KEY = "taiwan-mandarin-print-sheet-v1";

const fallbackSheet: PrintableSheet = {
  title: "No worksheet loaded",
  meta: "Return to the trainer and choose a worksheet to print.",
  body: "",
  note: "The printable page uses local browser storage so worksheets can be generated without a server."
};

export default function PrintPage() {
  const [sheet, setSheet] = useState<PrintableSheet>(fallbackSheet);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRINT_SHEET_KEY);
      if (raw) setSheet(JSON.parse(raw) as PrintableSheet);
    } catch {
      setSheet(fallbackSheet);
    } finally {
      setLoaded(true);
    }
  }, []);

  const trainerHref = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname.startsWith("/LearningMandarin") ? "/LearningMandarin/" : "/";
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#17211c]">
      <div className="print:hidden flex items-center justify-between gap-4 border-b border-black/10 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase text-jade-700">Printable sheet</p>
          <h1 className="text-lg font-black text-ink">{sheet.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button asChild variant="secondary">
            <a href={trainerHref}>Back to trainer</a>
          </Button>
        </div>
      </div>

      <PrintableSheetStyles />
      <section className="printable-page p-5 print:p-0">
        <header>
          <div>
            <h1>{sheet.title}</h1>
            <p className="meta">{sheet.meta}</p>
          </div>
        </header>
        {sheet.body ? (
          <div dangerouslySetInnerHTML={{ __html: sheet.body }} />
        ) : (
          <div className="empty-message">
            Return to the trainer and click a word-sheet print button.
          </div>
        )}
        <p className="note">{sheet.note}</p>
      </section>
    </main>
  );
}

function PrintableSheetStyles() {
  return (
    <style>{`
      @page { margin: 12mm; size: letter; }
      .printable-page { background: #fff; color: #17211c; font-family: Arial, "Noto Sans TC", "Microsoft JhengHei", sans-serif; }
      .printable-page * { box-sizing: border-box; }
      .printable-page header { align-items: center; border-bottom: 2px solid #17211c; display: flex; justify-content: space-between; gap: 16px; padding-bottom: 10px; }
      .printable-page h1 { font-size: 22px; margin: 0 0 4px; }
      .printable-page h2 { break-after: avoid; border-bottom: 1px solid #b8c7bf; font-size: 16px; margin: 18px 0 8px; padding-bottom: 5px; }
      .printable-page p { margin: 0; }
      .printable-page .meta { color: #496157; font-size: 13px; font-weight: 700; }
      .printable-page .word-sheet { display: grid; gap: 10px; margin-top: 14px; }
      .printable-page .practice-card { break-inside: avoid; border: 1.5px solid #9fb0a8; border-radius: 8px; display: grid; gap: 8px; grid-template-columns: 165px 70px minmax(0, 1fr); padding: 8px; }
      .printable-page .word-info { align-items: start; display: grid; gap: 8px; grid-template-columns: 24px minmax(0, 1fr); }
      .printable-page .number { color: #62756d; font-size: 12px; font-weight: 900; text-align: center; }
      .printable-page .word { font-family: "Noto Serif TC", "Microsoft JhengHei", serif; font-size: 28px; font-weight: 900; line-height: 1.05; }
      .printable-page .pinyin { color: #0f766e; font-size: 15px; font-weight: 900; line-height: 1.15; }
      .printable-page .meaning { font-size: 12px; font-weight: 800; line-height: 1.25; margin-top: 3px; }
      .printable-page .ko { color: #68766f; font-size: 11px; font-weight: 700; line-height: 1.2; margin-top: 2px; }
      .printable-page .model-row { align-content: start; display: flex; flex-wrap: wrap; gap: 5px; }
      .printable-page .practice-grid { display: grid; gap: 5px; grid-template-columns: repeat(6, 52px); justify-content: start; }
      .printable-page .tian-cell { background: #fff; border: 1.4px solid #54655d; display: inline-flex; height: 52px; justify-content: center; position: relative; width: 52px; }
      .printable-page .tian-cell::before, .printable-page .tian-cell::after { content: ""; left: 0; pointer-events: none; position: absolute; top: 0; }
      .printable-page .tian-cell::before { border-top: 1px dotted #9baaa3; top: 50%; width: 100%; }
      .printable-page .tian-cell::after { border-left: 1px dotted #9baaa3; height: 100%; left: 50%; }
      .printable-page .model-cell { align-items: center; background: #f7fbf9; color: #25342d; font-family: "Noto Serif TC", "Microsoft JhengHei", serif; font-size: 34px; font-weight: 900; }
      .printable-page .model-cell span { position: relative; z-index: 1; }
      .printable-page .repo-day { break-inside: avoid; }
      .printable-page .repo-grid { display: grid; gap: 6px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .printable-page .repo-card { align-items: center; border: 1px solid #b8c7bf; border-radius: 8px; display: grid; gap: 8px; grid-template-columns: 68px minmax(0, 1fr); padding: 7px; }
      .printable-page .repo-word { font-family: "Noto Serif TC", "Microsoft JhengHei", serif; font-size: 28px; font-weight: 900; line-height: 1; }
      .printable-page .note { border-top: 1px solid #b8c7bf; color: #62756d; font-size: 12px; font-weight: 700; margin-top: 14px; padding-top: 8px; }
      .printable-page .empty-message { border: 1px dashed #9fb0a8; color: #62756d; font-weight: 800; margin-top: 16px; padding: 20px; }
      @media print {
        html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
        .printable-page { padding: 0 !important; }
      }
    `}</style>
  );
}
