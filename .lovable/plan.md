# 'Nieuwe actie'-pagina overnemen en per mail versturen

## Wat je krijgt
- De volledige 'Nieuwe actie'-pagina uit Insight Flow Actions (foto, AI-analyse, 5W1H met 5× waarom) wordt de startpagina van dit project, in dezelfde stijl.
- De knop **Actie opslaan** stuurt alle ingevulde gegevens als nette e-mail naar één vast adres. Er wordt niets bewaard.
- Ontvanger is voorlopig een placeholder (`acties@voorbeeld.nl`); later vervang je die door het echte adres.
- Na verzenden: bevestiging "Actie verstuurd", bij fout een duidelijke melding.

## Voorwaarde: e-maildomein
Mail versturen kan alleen vanaf een domein dat je zelf bezit (bijv. melding@jouwbedrijf.nl). Dit project heeft nog geen domein ingesteld. Ik bouw alles, en open de e-mailinstelling zodat je het domein kunt koppelen; tot dat domein geverifieerd is worden er geen mails verzonden.

## Technisch
- Kopieer `src/routes/nieuw.tsx` (als `index.tsx`), benodigde `src/data/*`, `src/lib/*` (analyse, sentinel, pi-weights), `src/components/*`, `src/components/ui/*`, assets, en de styles/fonts uit `__root.tsx` en `styles.css`. Alleen-mailen: lokale store-opslag en navigatie naar `/acties` worden vervangen door een mailverzending.
- AI-foto-analyse draait server-side via de Lovable AI Gateway (overnemen van `photo-analysis.server.ts` + api-route).
- E-mailtemplates scaffolden, template `nieuwe-actie` met vaste `to` (placeholder), verzonden vanuit een server function na validatie; idempotency key per inzending. Foto gaat niet als bijlage mee (niet ondersteund) – alleen tekstvelden en analyse-resultaat.
- Head-metadata per route bijwerken.
