-- =============================================================================
-- Five Whys to Inbox in Snowflake — setup
--
-- Zet de 5W1H-app van Lovable volledig in Snowflake, zonder PDF-export:
-- formulier in Streamlit, foto's in een stage, AI-analyse met AI_COMPLETE,
-- meldingen en acties in tabellen. Alle data is fictief.
--
-- Draaien: open dit bestand in je Git-workspace, kies rechtsboven een warehouse
-- en voer alles uit (Ctrl + Shift + Enter). Opnieuw draaien mag: de tabellen
-- met jouw eigen meldingen blijven staan, alleen de demodata wordt ververst.
--
-- Workspacenaam: de COPY FILES-stappen lezen uit "five-whys-to-inbox".
-- Heet je workspace anders, pas die naam dan aan in stap 3 en 7.
-- =============================================================================


-- ---- Stap 1 — Omgeving -------------------------------------------------------
USE ROLE ACCOUNTADMIN;

CREATE DATABASE  IF NOT EXISTS FIVEWHYS;
CREATE SCHEMA    IF NOT EXISTS FIVEWHYS.APP;

CREATE WAREHOUSE IF NOT EXISTS FIVEWHYS_WH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND   = 60
  AUTO_RESUME    = TRUE
  COMMENT        = 'Five Whys to Inbox demo';

USE DATABASE  FIVEWHYS;
USE SCHEMA    APP;
USE WAREHOUSE FIVEWHYS_WH;


-- ---- Stap 2 — Stages en bestandsformaat --------------------------------------
-- FOTO_STAGE: server-side versleuteld, want AI_COMPLETE leest alleen foto's uit
-- stages met SNOWFLAKE_SSE. De directory-tabel houdt bij welke foto's er staan.
CREATE STAGE IF NOT EXISTS FOTO_STAGE
  DIRECTORY  = (ENABLE = TRUE)
  ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE')
  COMMENT    = 'Voorbeeldfoto''s en foto''s van nieuwe meldingen';

CREATE OR REPLACE STAGE DATA_STAGE
  DIRECTORY  = (ENABLE = TRUE)
  ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE')
  COMMENT    = 'JSON met voorbeelden en demodata uit de workspace';

CREATE OR REPLACE FILE FORMAT JSON_FORMAT
  TYPE              = 'JSON'
  STRIP_OUTER_ARRAY = TRUE;


-- ---- Stap 3 — Bestanden uit de workspace -------------------------------------
COPY FILES INTO @DATA_STAGE/
FROM 'snow://workspace/USER$.PUBLIC."five-whys-to-inbox"/versions/live/'
FILES = ('snowflake/data/voorbeelden.json', 'snowflake/data/meldingen_demo.json',
         'snowflake/data/acties_demo.json', 'snowflake/data/medewerkers.json',
         'snowflake/data/pi_lijst.json');

-- De foto's komen rechtstreeks uit src/assets van de app; geen kopie in de repo nodig.
COPY FILES INTO @FOTO_STAGE/
FROM 'snow://workspace/USER$.PUBLIC."five-whys-to-inbox"/versions/live/'
FILES = ('src/assets/demo-afval.jpg', 'src/assets/demo-labels.jpg', 'src/assets/demo-mat.jpg',
         'src/assets/demo-nooduitgang.jpg', 'src/assets/demo-olie.jpg', 'src/assets/demo-outbound.jpg',
         'src/assets/demo-pallet.jpg', 'src/assets/demo-scanner.jpg', 'src/assets/demo-tillen.jpg',
         'src/assets/demo-verlichting.jpg', 'src/assets/jefferson-memorial.jpg', 'src/assets/laadstation.jpg',
         'src/assets/nooduitgang.jpg', 'src/assets/olielekkage.jpg', 'src/assets/zwaar-tillen.jpg');

ALTER STAGE FOTO_STAGE REFRESH;

-- Verwacht: 15 foto's
SELECT COUNT(*) AS FOTOS FROM DIRECTORY(@FOTO_STAGE) WHERE RELATIVE_PATH LIKE 'src/assets/%';


-- ---- Stap 4 — Referentietabellen (worden bij elke run ververst) --------------
CREATE OR REPLACE TABLE VOORBEELDEN AS
SELECT $1:volgnr::INT           AS VOLGNR,
       $1:onderwerp::STRING     AS ONDERWERP,
       $1:indicatoren           AS INDICATOREN,
       $1:beschrijving::STRING  AS BESCHRIJVING,
       $1:foto_pad::STRING      AS FOTO_PAD,
       $1:foto_label::STRING    AS FOTO_LABEL,
       $1:waar::STRING          AS WAAR,
       $1:wat::STRING           AS WAT,
       $1:waarom::STRING        AS WAAROM,
       $1:hoe::STRING           AS HOE,
       $1:waaroms               AS WAAROMS
FROM @DATA_STAGE/snowflake/data/voorbeelden.json (FILE_FORMAT => 'JSON_FORMAT');

CREATE OR REPLACE TABLE MEDEWERKERS AS
SELECT $1:naam::STRING                  AS NAAM,
       $1:rol::STRING                   AS ROL,
       $1:is_huidige_gebruiker::BOOLEAN AS IS_HUIDIGE_GEBRUIKER
FROM @DATA_STAGE/snowflake/data/medewerkers.json (FILE_FORMAT => 'JSON_FORMAT');

CREATE OR REPLACE TABLE PI_LIJST AS
SELECT $1:onderwerp::STRING AS ONDERWERP,
       $1:pi::STRING        AS PI,
       $1:volgorde::INT     AS VOLGORDE
FROM @DATA_STAGE/snowflake/data/pi_lijst.json (FILE_FORMAT => 'JSON_FORMAT');


-- ---- Stap 5 — Werktabellen (blijven bestaan) en demodata ---------------------
-- MELDINGEN: de definitieve, door een mens gecontroleerde versie van het formulier.
-- AI_RUNS:   elk origineel AI-antwoord apart, ook mislukte; een fout is een uitkomst.
CREATE TABLE IF NOT EXISTS MELDINGEN (
    MELDING_ID    STRING,
    AANGEMAAKT    TIMESTAMP_LTZ,
    BIJGEWERKT    TIMESTAMP_LTZ,
    BRON          STRING,          -- demo of app
    INGELOGD_ALS  STRING,          -- Snowflake-gebruiker die opsloeg
    WIE           STRING,
    WANNEER       STRING,
    WAAR          STRING,
    AFDELING      STRING,
    ONDERWERP     STRING,
    INDICATOREN   VARIANT,
    TITEL         STRING,
    BESCHRIJVING  STRING,
    WAT           STRING,
    WAAROM        STRING,
    HOE           STRING,
    WAAROMS       VARIANT,         -- [{question, answer}] x 5
    SIGNAAL       STRING,
    FOTO_PAD      STRING,          -- pad in FOTO_STAGE
    FOTO_LABEL    STRING,
    AI_RUN_ID     STRING,
    SCORE         NUMBER(1, 0),
    PI_GEWICHTEN  VARIANT
);

CREATE TABLE IF NOT EXISTS ACTIES (
    ACTIE_ID             STRING,
    MELDING_ID           STRING,
    AANGEMAAKT           TIMESTAMP_LTZ,
    BIJGEWERKT           TIMESTAMP_LTZ,
    BRON                 STRING,
    TITEL                STRING,
    KPI                  STRING,
    AFWIJKING            STRING,
    ONDERWERP            STRING,
    AFDELING             STRING,
    EIGENAAR             STRING,
    TERMIJN_DAGEN        NUMBER,
    DEADLINE             DATE,
    AANPAK               STRING,
    STATUS               STRING,
    FEEDBACK             VARIANT,
    GEDAAN               STRING,
    RESULTAAT            STRING,
    GEKOPPELDE_ACTIE_ID  STRING
);

CREATE TABLE IF NOT EXISTS AI_RUNS (
    RUN_ID         STRING,
    AANGEMAAKT     TIMESTAMP_LTZ,
    INGELOGD_ALS   STRING,
    FOTO_PAD       STRING,
    WAAR           STRING,
    ONDERWERP      STRING,
    MODEL          STRING,
    PROMPT_VERSIE  STRING,
    STATUS         STRING,         -- GELUKT, ONGELDIG of FOUT
    DUUR_MS        NUMBER,
    RUW_ANTWOORD   STRING,
    ANALYSE        VARIANT,
    FOUT           STRING
);

-- Demodata uit de app opnieuw laden; datums opnieuw ten opzichte van vandaag
DELETE FROM ACTIES    WHERE BRON = 'demo';
DELETE FROM MELDINGEN WHERE BRON = 'demo';

INSERT INTO MELDINGEN (MELDING_ID, AANGEMAAKT, BIJGEWERKT, BRON, WIE, WANNEER, WAAR, AFDELING, ONDERWERP,
                       INDICATOREN, TITEL, BESCHRIJVING, WAT, WAAROM, HOE, WAAROMS, SIGNAAL, FOTO_PAD, FOTO_LABEL)
SELECT $1:melding_id::STRING,
       DATEADD(day, $1:dag_offset::INT, CURRENT_DATE())::TIMESTAMP_LTZ,
       CURRENT_TIMESTAMP(),
       'demo',
       $1:wie::STRING, $1:wanneer::STRING, $1:waar::STRING, $1:afdeling::STRING, $1:onderwerp::STRING,
       ARRAY_CONSTRUCT(),
       $1:titel::STRING, $1:beschrijving::STRING, $1:wat::STRING, $1:waarom::STRING, $1:hoe::STRING,
       $1:waaroms, $1:signaal::STRING, $1:foto_pad::STRING, $1:titel::STRING
FROM @DATA_STAGE/snowflake/data/meldingen_demo.json (FILE_FORMAT => 'JSON_FORMAT');

INSERT INTO ACTIES (ACTIE_ID, MELDING_ID, AANGEMAAKT, BIJGEWERKT, BRON, TITEL, KPI, AFWIJKING, ONDERWERP, AFDELING,
                    EIGENAAR, TERMIJN_DAGEN, DEADLINE, AANPAK, STATUS, FEEDBACK, GEDAAN, RESULTAAT, GEKOPPELDE_ACTIE_ID)
SELECT $1:actie_id::STRING,
       $1:melding_id::STRING,
       DATEADD(day, $1:dag_offset::INT, CURRENT_DATE())::TIMESTAMP_LTZ,
       CURRENT_TIMESTAMP(),
       'demo',
       $1:titel::STRING, $1:kpi::STRING, $1:afwijking::STRING, $1:onderwerp::STRING, $1:afdeling::STRING,
       $1:eigenaar::STRING,
       $1:deadline_offset::INT - $1:dag_offset::INT,
       DATEADD(day, $1:deadline_offset::INT, CURRENT_DATE()),
       $1:aanpak::STRING, $1:status::STRING, $1:feedback,
       NULLIF($1:gedaan::STRING, ''), NULLIF($1:resultaat::STRING, ''), $1:gekoppelde_actie_id::STRING
FROM @DATA_STAGE/snowflake/data/acties_demo.json (FILE_FORMAT => 'JSON_FORMAT');

-- Verwacht: 4 voorbeelden, 6 medewerkers, 22 PI's, 10 demomeldingen en 10 demo-acties
SELECT 'VOORBEELDEN' AS TABEL, COUNT(*) AS RIJEN FROM VOORBEELDEN
UNION ALL SELECT 'MEDEWERKERS', COUNT(*) FROM MEDEWERKERS
UNION ALL SELECT 'PI_LIJST', COUNT(*) FROM PI_LIJST
UNION ALL SELECT 'MELDINGEN (demo)', COUNT(*) FROM MELDINGEN WHERE BRON = 'demo'
UNION ALL SELECT 'ACTIES (demo)', COUNT(*) FROM ACTIES WHERE BRON = 'demo'
UNION ALL SELECT 'MELDINGEN (jij)', COUNT(*) FROM MELDINGEN WHERE BRON = 'app';


-- ---- Stap 6 — Overzicht ------------------------------------------------------
CREATE OR REPLACE VIEW V_OVERZICHT AS
SELECT m.MELDING_ID,
       m.AANGEMAAKT,
       m.BRON,
       m.WIE,
       m.WAAR,
       m.AFDELING,
       m.ONDERWERP,
       COALESCE(m.TITEL, m.WAT) AS TITEL,
       m.SIGNAAL,
       m.FOTO_PAD,
       m.SCORE,
       m.AI_RUN_ID,
       a.ACTIE_ID,
       a.TITEL                  AS ACTIE,
       a.EIGENAAR,
       a.AANPAK,
       a.STATUS,
       a.DEADLINE,
       CASE WHEN a.ACTIE_ID IS NULL                                  THEN 'Geen actie'
            WHEN a.STATUS IN ('Uitgevoerd', 'Resultaat gecontroleerd') THEN 'Opgelost'
            WHEN a.DEADLINE < CURRENT_DATE()                          THEN 'Verlopen'
            ELSE 'In werking'
       END                      AS ACTIESIGNAAL
FROM MELDINGEN m
LEFT JOIN ACTIES a ON a.MELDING_ID = m.MELDING_ID;

SELECT ACTIESIGNAAL, COUNT(*) AS AANTAL FROM V_OVERZICHT GROUP BY ACTIESIGNAAL ORDER BY AANTAL DESC;


-- ---- Stap 7 — Streamlit-app --------------------------------------------------
CREATE OR REPLACE STAGE STREAMLIT_STAGE
  DIRECTORY  = (ENABLE = TRUE)
  ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE');

COPY FILES INTO @STREAMLIT_STAGE/
FROM 'snow://workspace/USER$.PUBLIC."five-whys-to-inbox"/versions/live/'
FILES = ('snowflake/streamlit/streamlit_app.py', 'snowflake/streamlit/environment.yml',
         'snowflake/streamlit/.streamlit/config.toml');

CREATE OR REPLACE STREAMLIT FIVEWHYS.APP.FIVE_WHYS
  ROOT_LOCATION   = '@FIVEWHYS.APP.STREAMLIT_STAGE/snowflake/streamlit'
  MAIN_FILE       = 'streamlit_app.py'
  QUERY_WAREHOUSE = FIVEWHYS_WH
  TITLE           = 'Five Whys — nieuwe actie';

-- Link naar de app
SELECT 'https://app.snowflake.com/' || LOWER(CURRENT_ORGANIZATION_NAME()) || '/'
       || LOWER(CURRENT_ACCOUNT_NAME()) || '/#/streamlit-apps/FIVEWHYS.APP.FIVE_WHYS' AS APP_URL;


-- ---- Stap 8 — Proef: kan Cortex foto's lezen in dit account? -----------------
-- Bewust als laatste: lukt dit niet (model of regio), dan staat de app er al.
-- Geeft dit een fout over het model, kies dan een ander beeldmodel uit de
-- AI_COMPLETE-documentatie en zet dat ook bovenin streamlit_app.py (MODEL).
SELECT AI_COMPLETE('claude-sonnet-4-5',
                   'Beschrijf in één Nederlandse zin wat je op deze werkplekfoto ziet.',
                   TO_FILE('@FIVEWHYS.APP.FOTO_STAGE', 'src/assets/nooduitgang.jpg')) AS PROEF_BEELDANALYSE;


-- ---- Opruimen (optioneel) ----------------------------------------------------
-- DROP DATABASE IF EXISTS FIVEWHYS;
-- DROP WAREHOUSE IF EXISTS FIVEWHYS_WH;
