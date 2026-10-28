# Five Whys in Snowflake (testversie)

De pagina "Nieuwe actie" uit deze Lovable-app, nagebouwd als Streamlit-app in Snowflake.
Alles draait in Snowflake behalve de PDF-export, die is weggelaten.

## Wat erin zit

| Map | Inhoud |
|---|---|
| `sql/setup.sql` | Eén script: database `FIVEWHYS`, stages, tabellen, demodata, view en de Streamlit-app |
| `streamlit/` | De app (`streamlit_app.py`), pakketten (`environment.yml`) en kleuren (`.streamlit/config.toml`) |
| `data/` | Voorbeelden en demodata als JSON, gemaakt met `exporteer_uit_app.py` uit `src/data/*.ts` |

De 15 foto's komen rechtstreeks uit `src/assets/`.

## Draaien

1. Maak in Snowsight een Git-workspace van deze repo met de naam `five-whys-to-inbox`.
2. Wissel naar de branch `snowflake`.
3. Open `snowflake/sql/setup.sql`, kies een warehouse en voer alles uit (Ctrl+Shift+Enter).
4. Open de link uit de kolom `APP_URL`.

Het script kan opnieuw draaien: opgeslagen meldingen, acties en AI-analyses blijven staan, alleen de demorijen worden ververst.

## In de app

- **Foto**: uploaden of met de camera maken (`st.camera_input`). Geen aparte API nodig.
- **Analyseer met AI**: `AI_COMPLETE` met `claude-sonnet-4-5` op de foto in `FOTO_STAGE`. Elk antwoord, ook een mislukt antwoord, komt in `AI_RUNS`.
- **Actie opslaan**: schrijft naar `MELDINGEN` en `ACTIES`. Nog een keer opslaan werkt het record bij.
- **Voorbeeld / Nieuwe melding**: bladert door de 4 voorbeelden of maakt het formulier leeg.
- **Meldingen en acties**: overzicht van de 10 demomeldingen plus je eigen meldingen, met een knop om een melding te openen in het formulier.

## Opruimen

Onderaan `setup.sql` staan de `DROP`-regels (uitgecommentarieerd).
