import { kpiMeasures } from "@/data/examples";
import type { Topic } from "@/data/types";

export const GEDRAGSREGELS_FOCUS = `Focus: Gedragsregels. Kijk eerst naar de personen op de foto en toets hun gedrag en uitrusting aan de werkvloerregels: werkkleding (geen capuchon/hoodie op het hoofd, veiligheidsschoenen, hesje, handschoenen waar nodig), oortjes of koptelefoon, mobiel gebruik tijdens werk of rijden, sieraden, los haar, eten/drinken op de vloer, looproutes en voetgangerszones. Maak de zichtbare overtreding van een gedragsregel het hoofdprobleem in Wat. Andere zichtbare zaken (zoals pallets of opslag) hooguit kort als bijzaak. Houd de 5× waarom procesgericht en zonder schuld: denk aan regel onbekend, geen geschikte kleding beschikbaar, omstandigheden (bijv. kou), ontbrekend toezicht of onduidelijke instructie.`;

export const TOPIC_FOCUS: Record<Topic, string> = {
  Veiligheid: "Lean-bril Veiligheid: zoek gevaren en afwijkingen van de veilige standaard: 6S, vrije vluchtroutes en nooduitgangen, PBM, scheiding van voetgangers en heftrucks, stabiele opslag, lekkages en struikelgevaar.",
  Kwaliteit: "Lean-bril Kwaliteit: zoek waar fouten kunnen ontstaan: ontbrekende of onduidelijke labels, geen vaste plek, afwijking van standaardwerk, geen poka-yoke, kans op verwisseling of beschadiging. Doel: goed bij de eerste keer.",
  Productiviteit: "Lean-bril Productiviteit: zoek de 8 verspillingen (TIMWOODS: transport, voorraad, beweging, wachten, overproductie, overbewerking, fouten, onbenut talent) en verstoringen van flow: zoeken, dubbel handelen, onnodig lopen, opstopping.",
  Personeel: "Lean-bril Personeel: zoek belasting en randvoorwaarden voor mensen: ergonomie (tillen, bukken, reiken, herhaling), werkdruk, ontbrekende hulpmiddelen, instructie en inwerken van (flex)medewerkers.",
};

export const KPI_FOCUS: Record<string, string> = {
  "Gedragsregels": GEDRAGSREGELS_FOCUS,
  "Incidenten met letsel": "Incidenten met letsel: zoek zichtbare oorzaken die tot letsel kunnen leiden (beknelling, aanrijding, vallen, snijden) en welke barrière ontbreekt.",
  "Incidenten zonder letsel": "Incidenten zonder letsel: zoek schade aan goederen, stellingen of materieel en de ontbrekende barrière die dit voorkomt.",
  "Near misses: 30 dagen": "Near misses: benoem het zichtbare bijna-ongeval of onveilige situatie en welke barrière (afscheiding, markering, standaard, onderhoud) ontbreekt.",
  "Retouren binnen SLA": "Retouren binnen SLA: zoek retouren die blijven liggen, geen vaste plek of geen zichtbare prioriteit/volgorde (FIFO).",
  "Leeftijd retouren": "Leeftijd retouren: zoek oude of onverwerkte retouren, ontbrekende datum/visualisatie en opstapeling.",
  "Inbound doorlooptijd": "Inbound doorlooptijd: zoek goederen die na lossen blijven staan, geen vaste bufferplek, geen FIFO en wachten op vervolgstap.",
  "HBV doorlooptijd": "HBV doorlooptijd: zoek wachtrijen en onderbrekingen in de HBV-stroom, onduidelijke status en ontbrekende vaste plekken.",
  "Outbound vóór 18u": "Outbound vóór 18u: zoek wat de uitlevering vertraagt: opstopping bij expeditie, onduidelijke sortering, ontbrekende labels of wachten.",
  "Inbound na 12u": "Inbound na 12u: zoek wat verwerking na de middag belemmert: achterstand op de vloer, onduidelijke prioriteit, onvoldoende ruimte.",
  "Orders in Full": "Orders in Full: zoek oorzaken van onvolledige orders: verkeerde of ontbrekende locatie, labels, voorraad niet zichtbaar, verwisseling.",
  "Stock zelfde dag": "Stock zelfde dag: zoek goederen die niet dezelfde dag opgeslagen worden: geen vaste plek, wachten op inslag, onduidelijke status.",
  "Print dag na laatste PF-scan": "Print dag na laatste PF-scan: zoek wachten tussen scan en print, ontbrekende signalering en onduidelijke overdracht.",
  "Retouren Index": "Retouren Index: zoek verspilling in de retourverwerking: zoeken, dubbel handelen, lopen, onduidelijke werkplekinrichting.",
  "OFM Index": "OFM Index: zoek verspilling in de OFM-zone: zoeken, onnodig lopen, wachten, slechte werkplekinrichting.",
  "WPL Index": "WPL Index: zoek verspilling bij WPL-goederen: geen vaste plek, zoeken, dubbel handelen, vermenging met andere stromen.",
  "Healthcare Index": "Healthcare Index: zoek verspilling bij healthcare-goederen: geen vaste plek of belijning, zoeken, dubbel handelen, vermenging.",
  "WPI direct": "WPI direct: zoek directe productiviteitsverliezen op de werkplek: wachten, zoeken, onnodige beweging en storingen.",
  "Ziekteverzuim": "Ziekteverzuim: zoek fysieke belasting (tilbelasting, houding, herhaling) en ontbrekende hulpmiddelen.",
  "Lang verzuim": "Lang verzuim: zoek structurele overbelasting: zwaar of eenzijdig werk de hele dienst, slechte ergonomie, geen rotatie.",
  "Verhouding vast / flex": "Verhouding vast / flex: zoek signalen van onvoldoende instructie of begeleiding: onduidelijke standaarden, ontbrekende visuele werkinstructies.",
  "Aandeel flex": "Aandeel flex: zoek of de werkplek zelf-uitleggend is voor nieuwe medewerkers: visuele instructies, markeringen, vaste plekken.",
};

export function buildFocus(topic: Topic, indicators: string[]): string {
  const valid = indicators.filter((i) => kpiMeasures[topic].includes(i));
  const parts = [TOPIC_FOCUS[topic], ...valid.map((i) => KPI_FOCUS[i] ?? `Focus: ${i}.`)];
  if (valid.length) parts.push(`Koppel de effectcontrole in Hoe aan: ${valid.join(", ")}.`);
  return parts.join(" ");
}
