import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createActionPdf, type ActionPdfData, type PdfResources } from "@/lib/action-pdf";
import { emptyForm, examples } from "@/data/examples";

const resources: PdfResources = {
  regularFont: readFileSync("public/fonts/action-regular.ttf").toString("base64"),
  boldFont: readFileSync("public/fonts/action-bold.ttf").toString("base64"),
  palette: { ink: "#121418", muted: "#696c70", brand: "#e85d3a", border: "#e2e2e2", soft: "#f6f6f6", paper: "#ffffff" },
};
const action: ActionPdfData = { form: examples[0] ?? emptyForm, wie: "Freek Wijn", wanneer: "28 oktober 2026", eigenaar: "", termijn: "14 dagen", aanpak: "Actie / Just Do It", score: null };

describe("Action PDF export", () => {
  it("exports each 5W1H example on exactly one PDF page", () => {
    for (const form of examples) {
      const pdf = createActionPdf({ ...action, form }, resources);
      expect(pdf.getNumberOfPages()).toBe(1);
      expect(pdf.output("arraybuffer").byteLength).toBeGreaterThan(1000);
    }
  });
  it("requires the factual observation before exporting", () => {
    expect(() => createActionPdf({ ...action, form: emptyForm }, resources)).toThrow("Wat");
  });
});