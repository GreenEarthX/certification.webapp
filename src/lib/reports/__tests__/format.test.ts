import {
  REF_COLORS,
  formatReportTimestamp,
  refListText,
  refText,
  wordColor,
} from "../format";
import type { ComponentRef } from "../types";

describe("formatReportTimestamp", () => {
  it("renders YYYY-MM-DD HH:MM in 24-hour time", () => {
    // Constructed from local parts so the assertion is timezone-independent.
    const iso = new Date(2026, 8, 1, 14, 32).toISOString();
    expect(formatReportTimestamp(iso)).toBe("2026-09-01 14:32");
  });

  it("zero-pads single-digit months, days, hours and minutes", () => {
    const iso = new Date(2026, 0, 5, 7, 4).toISOString();
    expect(formatReportTimestamp(iso)).toBe("2026-01-05 07:04");
  });

  it("uses 24-hour time rather than wrapping at noon", () => {
    const iso = new Date(2026, 8, 1, 23, 59).toISOString();
    expect(formatReportTimestamp(iso)).toBe("2026-09-01 23:59");
  });

  it("returns a dash for an unparseable value", () => {
    expect(formatReportTimestamp("not-a-date")).toBe("—");
    expect(formatReportTimestamp("")).toBe("—");
  });
});

describe("wordColor", () => {
  it("colours equipment, gate and carrier reference tokens", () => {
    expect(wordColor("(E1)")).toBe(REF_COLORS.equipment);
    expect(wordColor("(G12)")).toBe(REF_COLORS.gate);
    expect(wordColor("(C3)")).toBe(REF_COLORS.carrier);
  });

  it("accepts a trailing separator left by a joined list", () => {
    expect(wordColor("(E6),")).toBe(REF_COLORS.equipment);
    expect(wordColor("(G2);")).toBe(REF_COLORS.gate);
  });

  it("leaves anything that is not a reference token as body text", () => {
    for (const w of ["(X1)", "E1", "(E)", "Dryer", "(E1", "E1)", "", "()"]) {
      expect(wordColor(w)).toBeNull();
    }
  });
});

describe("ref text", () => {
  const ref = (label: string, r: string): ComponentRef => ({
    label,
    ref: r,
    kind: "equipment",
  });

  it("renders a single ref as 'Name (ID)'", () => {
    expect(refText(ref("Dryer Unit", "E6"))).toBe("Dryer Unit (E6)");
  });

  it("comma-joins a list", () => {
    expect(refListText([ref("Shredder", "E1"), ref("Mixer", "E2")])).toBe(
      "Shredder (E1), Mixer (E2)"
    );
  });

  it("renders an empty list as a dash", () => {
    expect(refListText([])).toBe("—");
  });

  it("produces tokens that wordColor can classify after splitting", () => {
    const text = refListText([ref("Dryer Unit", "E6")]);
    const words = text.split(" ");
    expect(wordColor(words[words.length - 1])).toBe(REF_COLORS.equipment);
  });
});
