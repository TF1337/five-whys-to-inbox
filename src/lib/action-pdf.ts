import { jsPDF } from "jspdf";
import type { CoachForm } from "@/data/examples";

export type ActionPdfData = {
  form: CoachForm;
  wie: string;
  wanneer: string;
  eigenaar: string;
  termijn: string;
  aanpak: string;
  score: number | null;
};

export type PdfPalette = { ink: string; muted: string; brand: string; border: string; soft: string; paper: string };
export type PdfResources = { regularFont: string; boldFont: string; photo?: string; palette: PdfPalette };

// Resolve the page's semantic tokens into sRGB for the PDF drawing engine.
export function readPdfPalette(): PdfPalette {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("De PDF-opmaak kon niet worden geladen.");
  const styles = getComputedStyle(document.documentElement);
  const color = (token: string) => {
    context.fillStyle = styles.getPropertyValue(token).trim();
    context.fillRect(0, 0, 1, 1);
    return `#${Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map(v => v.toString(16).padStart(2, "0")).join("")}`;
  };
  return { ink: color("--foreground"), muted: color("--muted-foreground"), brand: color("--accent"), border: color("--border"), soft: color("--muted"), paper: color("--card") };
}

let fonts: Promise<[string, string]> | undefined;
async function fontBase64(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("De PDF-lettertypen konden niet worden geladen. Probeer opnieuw.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

export async function preparePdfResources(photo: string): Promise<PdfResources> {
  fonts ??= Promise.all([fontBase64("/fonts/action-regular.ttf"), fontBase64("/fonts/action-bold.ttf")]).catch(error => { fonts = undefined; throw error; });
  const [regularFont, boldFont] = await fonts;
  let imageData: string | undefined;
  if (photo) {
    const image = new Image();
    image.src = photo;
    await image.decode();
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("De foto kon niet aan de PDF worden toegevoegd.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    imageData = canvas.toDataURL("image/jpeg", 0.88);
  }
  return { regularFont, boldFont, photo: imageData, palette: readPdfPalette() };
}

export function createActionPdf(data: ActionPdfData, resources: PdfResources): jsPDF {
  if (!data.form.what.trim()) throw new Error("Vul bij 'Wat' de feitelijke waarneming in.");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.addFileToVFS("Action-Regular.ttf", resources.regularFont);
  doc.addFont("Action-Regular.ttf", "Action", "normal");
  doc.addFileToVFS("Action-Bold.ttf", resources.boldFont);
  doc.addFont("Action-Bold.ttf", "Action", "bold");
  doc.setProperties({ title: "5W1H-analyse — SLA Healthcare", subject: data.form.what, creator: "SLA Healthcare" });
  const p = resources.palette;
  const margin = 36, width = doc.internal.pageSize.getWidth() - margin * 2;
  const text = (value: string, x: number, y: number, size: number, bold = false, color = p.ink) => {
    doc.setFont("Action", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(color);
    doc.text(value, x, y);
  };
  text("SLA Healthcare", margin, 48, 12, true);
  text("ACTIERAPPORT", margin, 65, 8, false, p.muted);
  text("5W1H-analyse", margin, 99, 24, true);
  doc.setFillColor(p.brand); doc.rect(margin, 111, 42, 3, "F");

  const rows: Array<[string, string, boolean?]> = [
    ["Type observatie", data.form.tag],
    ["Prestatieindicatoren", data.form.indicators.join(" · ") || "—"],
    ["Wie", data.wie], ["Wanneer", data.wanneer], ["Waar", data.form.where],
    ["Wat · het probleem", data.form.what],
    ["Waarom · grondoorzaak", data.form.why],
    ...data.form.whys.map((why, i): [string, string, boolean?] => [`${i + 1}× Waarom`, `${why.question}\n${why.answer || "—"}`]),
    ["Hoe · maatregel & controle", data.form.how, true],
    ["Verantwoordelijke", data.eigenaar || "—"], ["Termijn", data.termijn], ["Aanpak", data.aanpak],
    ["Score", data.score === null ? "Niet beoordeeld" : `${data.score}%`],
  ];
  const top = resources.photo ? 245 : 133;
  const available = 790 - top;
  const labelWidth = 139, contentWidth = width - labelWidth - 18;
  const layout = (size: number) => {
    doc.setFont("Action", "normal"); doc.setFontSize(size);
    return rows.map(([label, value, highlight]) => {
      const lines = doc.splitTextToSize(value.trim() || "—", contentWidth) as string[];
      const labelLines = doc.splitTextToSize(label, labelWidth - 18) as string[];
      return { lines, labelLines, highlight, height: Math.max(lines.length, labelLines.length) * size * 1.3 + size * 1.05 };
    });
  };
  let size = 9;
  let blocks = layout(size);
  while (blocks.reduce((sum, block) => sum + block.height, 0) > available && size > 4.5) {
    size -= 0.25; blocks = layout(size);
  }
  if (blocks.reduce((sum, block) => sum + block.height, 0) > available) {
    throw new Error("De tekst is te lang voor één leesbare PDF-pagina. Kort de antwoorden in en probeer opnieuw.");
  }
  if (resources.photo) {
    const image = doc.getImageProperties(resources.photo);
    const scale = Math.min(width / image.width, 100 / image.height);
    doc.setFillColor(p.soft); doc.rect(margin, 129, width, 100, "F");
    doc.addImage(resources.photo, "JPEG", margin + (width - image.width * scale) / 2, 129 + (100 - image.height * scale) / 2, image.width * scale, image.height * scale);
  }
  let y = top;
  blocks.forEach((block, i) => {
    if (i % 2 === 0 || block.highlight) {
      doc.setFillColor(p.soft); doc.rect(margin, y, width, block.height, "F");
    }
    doc.setFont("Action", "bold"); doc.setFontSize(size); doc.setTextColor(p.ink);
    doc.text(block.labelLines, margin + 9, y + size * 1.3, { lineHeightFactor: 1.3 });
    doc.setFont("Action", block.highlight ? "bold" : "normal");
    doc.text(block.lines, margin + labelWidth, y + size * 1.3, { lineHeightFactor: 1.3 });
    y += block.height;
  });
  doc.setDrawColor(p.border); doc.line(margin, 804, margin + width, 804);
  text("Vertrouwelijk · SLA Healthcare", margin, 820, 8, false, p.muted);
  text("Pagina 1 van 1", margin + width - 69, 820, 8, false, p.muted);
  return doc;
}