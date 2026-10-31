# AI laten redeneren vanuit gedragsregels

## Probleem
De AI krijgt nu alleen de foto, zone en "Veiligheid" mee. Welke KPI's je aanvinkt (bijv. "Gedragsregels") weet de AI niet. Daarom zoekt hij zelf de meest opvallende afwijking — zoals een scheve pallet — in plaats van de persoon met capuchon.

## Wat verandert er
1. **Aangevinkte KPI's gaan mee naar de AI.** Vink je "Gedragsregels" aan, dan weet de AI dat het om gedrag van mensen gaat.
2. **Speciale focus bij Gedragsregels.** De AI kijkt dan eerst naar personen en toetst aan de werkvloerregels:
   - Werkkleding: geen capuchon/hoodie op, veiligheidsschoenen, hesje, handschoenen waar nodig
   - Oortjes / koptelefoon
   - Mobiel gebruik tijdens werk of rijden
   - Sieraden, los haar, eten/drinken op de vloer
   - Looproutes en voetgangerszones
   Andere zichtbare zaken (zoals een pallet) mag hij hooguit kort als bijzaak noemen, niet als hoofdprobleem.
3. **5× waarom blijft procesgericht.** Ook bij gedrag geen schuld bij de persoon, maar oorzaken als: regel onbekend, geen kleding beschikbaar, kou in de hal, geen toezicht of onduidelijke instructie — gemarkeerd als "Hypothese, te toetsen".
4. Bij andere KPI's (near misses, ziekteverzuim, …) krijgt de AI ook die KPI mee als focus.

## Open punt
De lijst met regels hierboven is door mij bedacht. Heb je de echte gedragsregels van jullie werkvloer, dan zet ik die erin.

## Technisch
- `analysePhoto` en `/api/analyse` krijgen een extra veld `indicators` (array, gevalideerd tegen `kpiMeasures`).
- In `photo-analysis.server.ts` een extra focusblok aan de prompt toevoegen als "Gedragsregels" geselecteerd is; anders de gekozen KPI's als focusregel.
- Test: prompt-opbouw bevat de gedragsregels-focus alleen als "Gedragsregels" is aangevinkt.
