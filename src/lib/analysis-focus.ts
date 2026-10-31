import { kpiMeasures } from "@/data/examples";
import type { Topic } from "@/data/types";

export const GEDRAGSREGELS_FOCUS = `Focus: Gedragsregels. Kijk eerst naar de personen op de foto en toets hun gedrag en uitrusting aan de werkvloerregels: werkkleding (geen capuchon/hoodie op het hoofd, veiligheidsschoenen, hesje, handschoenen waar nodig), oortjes of koptelefoon, mobiel gebruik tijdens werk of rijden, sieraden, los haar, eten/drinken op de vloer, looproutes en voetgangerszones. Maak de zichtbare overtreding van een gedragsregel het hoofdprobleem in Wat. Andere zichtbare zaken (zoals pallets of opslag) hooguit kort als bijzaak. Houd de 5× waarom procesgericht en zonder schuld: denk aan regel onbekend, geen geschikte kleding beschikbaar, omstandigheden (bijv. kou), ontbrekend toezicht of onduidelijke instructie.`;

export function buildFocus(topic: Topic, indicators: string[]): string {
  const valid = indicators.filter((i) => kpiMeasures[topic].includes(i));
  if (valid.includes("Gedragsregels")) {
    const rest = valid.filter((i) => i !== "Gedragsregels");
    return GEDRAGSREGELS_FOCUS + (rest.length ? ` Weeg ook mee: ${rest.join(", ")}.` : "");
  }
  return valid.length ? `Focus van de analyse: ${valid.join(", ")}.` : "";
}
