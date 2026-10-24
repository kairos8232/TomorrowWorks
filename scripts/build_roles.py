"""Build data/roles.json: the curated role set, adapted from ESCO v1.2.1.

Usage:
    python3 scripts/build_roles.py "data/raw/ESCO dataset - v1.2.1 - classification - en - csv"

Each role is one ESCO occupation, chosen by its URI in ROLE_SELECTION below.
Everything else (label, ISCO group, description, essential and optional
skills) is copied from the ESCO files, so nothing about a role is typed by
hand except the reason it is in the demo set.

Skills are tagged with two flags taken from ESCO's own collections:
  green   - listed in greenSkillsCollection_en.csv
  digital - listed in digitalSkillsCollection_en.csv
These flags are later used for sourced SDG links; they are not SDG claims
by themselves.

The output is an *adapted* selection of ESCO, labelled as such in the file.
"""
import csv
import json
import sys
from pathlib import Path

ESCO = "http://data.europa.eu/esco/occupation/"

# (ESCO occupation URI, why the role is in the demo set)
ROLE_SELECTION = [
    (ESCO + "bafbc672-0ad9-41af-9de8-db0c91a24f9b", "Clerical end of the path; ISCO 4311 is in the ILO's highest exposure gradient."),
    (ESCO + "bfe142b9-a049-4d41-89c4-fd2f34ac56b6", "The demo user's current job: junior accounting work."),
    (ESCO + "c3aae59e-1441-4b3e-bdd1-6da50dc7cf42", "Sibling role at the same level."),
    (ESCO + "eda0d957-3c3c-4139-b89a-a18bc9e18897", "Promotion path; accountants are a top-five advertised job in DOSM's Q2 2026 release."),
    (ESCO + "8d586ee9-0ab1-4155-a3b0-2ca786c8e48c", "Analytics move with high exposure: a useful contrast."),
    (ESCO + "60082a99-d8ef-4e84-9290-78902681b6ed", "Process and transformation move."),
    (ESCO + "d3edb8f8-3a06-47a0-8fb9-9b212c006aa2", "Data move commonly taken from accounting."),
    (ESCO + "f2b15a0e-e65a-438a-affb-29b9d50b77d1", "Software developers are a top-five advertised job in DOSM's Q2 2026 release; a long reskilling path."),
    (ESCO + "2cf2b905-3308-4b5d-8e8d-633fc7a3f3ce", "Sustainability (ESG) move; low GenAI exposure."),
]


def read_csv(folder, name):
    with open(Path(folder) / name, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def main(folder):
    occupations = {o["conceptUri"]: o for o in read_csv(folder, "occupations_en.csv")}
    skills = {s["conceptUri"]: s for s in read_csv(folder, "skills_en.csv")}  # duplicates collapse here
    green = {s["conceptUri"] for s in read_csv(folder, "greenSkillsCollection_en.csv")}
    digital = {s["conceptUri"] for s in read_csv(folder, "digitalSkillsCollection_en.csv")}
    relations = read_csv(folder, "occupationSkillRelations_en.csv")

    roles = []
    for uri, reason in ROLE_SELECTION:
        occ = occupations.get(uri)
        if occ is None:
            sys.exit(f"ESCO occupation not found: {uri}")
        role_skills = {"essential": [], "optional": []}
        for r in relations:
            if r["occupationUri"] != uri:
                continue
            s = skills.get(r["skillUri"])
            if s is None:
                sys.exit(f"Skill {r['skillUri']} for {occ['preferredLabel']} missing from skills_en.csv")
            role_skills[r["relationType"]].append({
                "uri": s["conceptUri"],
                "label": s["preferredLabel"],
                "type": s["skillType"] or "unspecified",
                "green": s["conceptUri"] in green,
                "digital": s["conceptUri"] in digital,
            })
        for kind in role_skills:
            role_skills[kind].sort(key=lambda s: s["label"].lower())
        roles.append({
            "id": occ["preferredLabel"].replace(" ", "-").lower(),
            "title": occ["preferredLabel"],
            "escoUri": uri,
            "escoCode": occ["code"],
            "isco": occ["iscoGroup"],
            "iscoMajorGroup": occ["iscoGroup"][0],
            "description": occ["description"].strip(),
            "whyInDemoSet": reason,
            "essentialSkills": role_skills["essential"],
            "optionalSkills": role_skills["optional"],
        })

    out = {
        "source": {
            "name": "ESCO v1.2.1 classification (English)",
            "publisher": "European Commission",
            "url": "https://esco.ec.europa.eu/en/use-esco/download",
            "version": "v1.2.1 (last update 10 Dec 2025)",
            "retrievedAt": "2026-10-21",
            "acknowledgement": "This service uses the ESCO classification of the European Commission.",
            "adaptation": "Adapted selection: nine ESCO occupations chosen for the TomorrowWorks demo; "
                          "skills and flags copied unchanged from ESCO. Not an official ESCO product.",
            "licence": "Commission Decision 2011/833/EU (free reuse with acknowledgement)",
        },
        "roles": roles,
    }
    Path("data/roles.json").write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for r in roles:
        g = sum(s["green"] for s in r["essentialSkills"])
        d = sum(s["digital"] for s in r["essentialSkills"])
        print(f"{r['title']:24} ISCO {r['isco']}  essential {len(r['essentialSkills']):3}  "
              f"optional {len(r['optionalSkills']):3}  green {g:2}  digital {d:2}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
