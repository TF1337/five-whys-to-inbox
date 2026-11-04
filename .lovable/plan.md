# AI-analyse verbeteren volgens Lean en Operational Excellence

## Probleem
Op dit moment krijgt alleen "Gedragsregels" een eigen manier van kijken. Bij alle andere meetpunten krijgt de AI alleen de naam ("Focus: Near misses"). Hij weet dan niet waar hij op de foto op moet letten, en kiest de afwijking die het meest opvalt. Daardoor gaan sommige analyses mis.

## Wat verandert er (onderwerpen, meetpunten en velden blijven hetzelfde)
1. **Elk onderwerp krijgt een Lean-bril**, die ook geldt als je geen meetpunt aanvinkt:
   - Veiligheid: gevaren, 6S, vluchtroutes, PBM, verkeer van mens en heftruck
   - Kwaliteit: fouten maken onmogelijk (poka-yoke), standaardwerk, labels, goed bij de eerste keer
   - Productiviteit: de 8 verspillingen (TIMWOODS), flow, zoeken, wachten, onnodig lopen
   - Personeel: ergonomie, werkdruk, opleiding, flexkrachten inwerken
2. **Elk meetpunt krijgt een eigen focusregel**, zoals bij Gedragsregels: waar de AI op de foto naar moet kijken en welke oorzaken waarschijnlijk zijn. Bijvoorbeeld:
   - Near misses: het bijna-ongeluk dat je kunt zien, en welke barrière ontbreekt
   - Inbound doorlooptijd: goederen die blijven staan, geen vaste plek, geen FIFO
   - OFM/WPL/Healthcare Index: verspilling in deze zone (zoeken, lopen, dubbel handelen)
   - Ziekteverzuim/Lang verzuim: tilbelasting, houding, herhaald werk
3. **Strengere Lean-regels voor alle analyses:**
   - Wat = één hoofdafwijking: wat er moet zijn tegenover wat er is
   - De 5× waarom gaat van de werkplek naar de methode, het materiaal, de machine en het management, en eindigt bij een oorzaak in het systeem (standaard, borging, eigenaar)
   - Hoe volgt PDCA: een directe maatregel, een structurele maatregel en een meetbare check die aan het gekozen meetpunt vastzit
   - Nooit schuld bij een persoon. Wat je niet op de foto ziet, blijft "Hypothese, te toetsen"
4. **Test met de voorbeelden:** ik probeer de echte AI op de zes voorbeeldfoto's (zonder ingevulde velden) en controleer of de hoofdafwijking klopt.

## Open punt
Welke analyses gingen mis (welk onderwerp of meetpunt)? Die neem ik als eerste mee. De focusregels zijn door mij bedacht, dus ik pas ze graag aan op jullie eigen standaarden.

## Technisch
- `analysis-focus.ts`: `TOPIC_FOCUS` per onderwerp en `KPI_FOCUS` per meetpunt (alle meetpunten uit `kpiMeasures`). `buildFocus` voegt de onderwerpfocus en de focus van de gekozen meetpunten samen. De Gedragsregels-tekst blijft ongewijzigd.
- `LEAN_PHOTO_PROMPT` aanvullen met: standaard tegenover afwijking, 4M/8 verspillingen en een PDCA-check die aan het meetpunt vastzit.
- Tests: elk meetpunt in `kpiMeasures` heeft een focusregel; onderwerpfocus zonder meetpunt; meetpunten van een ander onderwerp worden genegeerd; Gedragsregels werkt zoals nu.
