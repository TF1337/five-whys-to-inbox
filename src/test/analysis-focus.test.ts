import { describe, expect, it } from "vitest";
import { buildFocus, GEDRAGSREGELS_FOCUS, KPI_FOCUS, TOPIC_FOCUS } from "@/lib/analysis-focus";
import { kpiMeasures } from "@/data/examples";

describe("AI focus per KPI", () => {
  it("adds behaviour-rule focus when Gedragsregels is selected", () => {
    expect(buildFocus("Veiligheid", ["Gedragsregels"])).toContain(GEDRAGSREGELS_FOCUS);
  });
  it("does not add behaviour focus otherwise", () => {
    expect(buildFocus("Veiligheid", ["Near misses: 30 dagen"])).not.toContain(GEDRAGSREGELS_FOCUS);
  });
  it("uses the topic lens without KPIs", () => {
    expect(buildFocus("Productiviteit", [])).toBe(TOPIC_FOCUS.Productiviteit);
  });
  it("ignores KPIs that do not belong to the topic", () => {
    expect(buildFocus("Personeel", ["Gedragsregels"])).toBe(TOPIC_FOCUS.Personeel);
  });
  it("every KPI has its own focus rule", () => {
    for (const list of Object.values(kpiMeasures)) for (const k of list) expect(KPI_FOCUS[k]).toBeTruthy();
  });
});
