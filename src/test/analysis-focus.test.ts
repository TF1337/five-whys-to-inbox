import { describe, expect, it } from "vitest";
import { buildFocus, GEDRAGSREGELS_FOCUS } from "@/lib/analysis-focus";

describe("AI focus per KPI", () => {
  it("adds behaviour-rule focus when Gedragsregels is selected", () => {
    expect(buildFocus("Veiligheid", ["Gedragsregels"])).toContain(GEDRAGSREGELS_FOCUS);
  });
  it("does not add behaviour focus otherwise", () => {
    expect(buildFocus("Veiligheid", ["Near misses: 30 dagen"])).not.toContain("Gedragsregels");
    expect(buildFocus("Veiligheid", [])).toBe("");
  });
  it("ignores KPIs that do not belong to the topic", () => {
    expect(buildFocus("Personeel", ["Gedragsregels"])).toBe("");
  });
});
