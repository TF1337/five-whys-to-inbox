"""Exporteert de voorbeelden en demodata van de Lovable-app naar JSON voor Snowflake.

Bron: src/data/examples.ts en src/data/mock.ts. Draaien vanuit de repo-root (Node 22+ nodig):
    python3 snowflake/data/exporteer_uit_app.py
Datums uit mock.ts staan relatief aan vandaag (isoDay); hier worden ze als dag-offset bewaard,
zodat Snowflake ze bij het laden opnieuw ten opzichte van CURRENT_DATE zet.
"""
import json
import re
import subprocess
import tempfile
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
UIT = Path(__file__).resolve().parent
FOTO_MAP = "src/assets/"


def evalueer(bestand: str, export: str) -> dict:
    s = (REPO / "src/data" / bestand).read_text(encoding="utf-8")
    s = re.sub(r'import (\w+) from "@/assets/([^"]+)";', r'const \1 = "\2";', s)
    s = re.sub(r"import type .*?;\n", "", s)
    s = re.sub(r'import \{[^}]*\} from "[^"]+";\n', "", s)
    s = re.sub(r"(const|let) (\w+): [^=]+=", r"\1 \2 =", s)          # typeannotaties weg
    s = re.sub(r"export (const|function)", r"\1", s)
    with tempfile.NamedTemporaryFile("w", suffix=".ts", delete=False) as f:
        f.write(s + f"\nconsole.log(JSON.stringify({export}));\n")
    uit = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", f.name],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(uit)


ex = evalueer("examples.ts", "{examples, kpiMeasures, currentUser, assignees}")
mk = evalueer("mock.ts", "{obs: MOCK_OBSERVATIONS, acts: MOCK_ACTIONS}")
vandaag = date.today()


def offset(iso: str):
    return (date.fromisoformat(iso) - vandaag).days if iso else None


voorbeelden = [{
    "volgnr": i + 1, "onderwerp": e["tag"], "indicatoren": e["indicators"], "beschrijving": e["description"],
    "foto_pad": FOTO_MAP + e["photo"], "foto_label": e["photoLabel"], "waar": e["where"],
    "wat": e["what"], "waarom": e["why"], "hoe": e["how"], "waaroms": e["whys"],
} for i, e in enumerate(ex["examples"])]

meldingen = [{
    "melding_id": o["id"], "titel": o["title"], "beschrijving": o["description"],
    "foto_pad": FOTO_MAP + o["photo"] if o.get("photo") else None, "afdeling": o["dept"], "onderwerp": o["topic"],
    "signaal": o["signal"], "melder": o["reporter"], "dag_offset": offset(o["createdAt"]),
    "wie": o["w5h"]["wie"], "wat": o["w5h"]["wat"], "waar": o["w5h"]["waar"], "wanneer": o["w5h"]["wanneer"],
    "waarom": o["w5h"]["waarom"], "hoe": o["w5h"]["hoe"], "waaroms": o.get("whys") or [],
} for o in mk["obs"]]

acties = [{
    "actie_id": a["id"], "melding_id": a.get("observationId"), "titel": a["title"], "kpi": a["kpi"],
    "afwijking": a["deviation"], "onderwerp": a["topic"], "afdeling": a["dept"], "eigenaar": a["owner"],
    "deadline_offset": offset(a["due"]), "aanpak": a["priority"], "status": a["status"],
    "feedback": a.get("feedback") or [], "gedaan": a.get("gedaan") or "", "resultaat": a.get("resultaat") or "",
    "dag_offset": offset(a["createdAt"]), "gekoppelde_actie_id": a.get("linkedActionId"),
} for a in mk["acts"]]

medewerkers = [{"naam": ex["currentUser"], "rol": "Melder (ingelogde demogebruiker)", "is_huidige_gebruiker": True}]
medewerkers += [{"naam": p["name"], "rol": p["role"], "is_huidige_gebruiker": False} for p in ex["assignees"]]

pi_lijst = [{"onderwerp": t, "pi": pi, "volgorde": i + 1}
            for t, lijst in ex["kpiMeasures"].items() for i, pi in enumerate(lijst)]

for naam, data in [("voorbeelden", voorbeelden), ("meldingen_demo", meldingen), ("acties_demo", acties),
                   ("medewerkers", medewerkers), ("pi_lijst", pi_lijst)]:
    (UIT / f"{naam}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{naam}.json: {len(data)}")
