import {
  REF_COLORS,
  componentText,
  formatQuantity,
  formatReportTimestamp,
  priceText,
  rateText,
  refListText,
  flowText,
  flowUnitText,
  flowValueText,
  refText,
  wordColor,
} from "../format";
import type {
  BoundaryStreamRow,
  ComponentRef,
  StreamComponent,
} from "../types";

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

// ───────────────────────────── Process Flow Operations ─────────────────────

const component = (over: Partial<StreamComponent> = {}): StreamComponent => ({
  field_name: "Methane Mass Flow Rate",
  label: "Methane",
  value: {
    hourly: 6,
    daily: 144,
    yearly: 52_560,
    unit: "kg",
    declared_unit: "kg/h",
    declared_basis: "hour",
  },
  ...over,
});

const row = (over: Partial<BoundaryStreamRow> = {}): BoundaryStreamRow => ({
  id: "S1",
  direction: "upstream",
  gate_id: "G1",
  gate: "Biogenic Supply",
  carrier: "Biogas",
  flow: { quantity: 20, unit: "kg/h" },
  components: [component()],
  economic_impact: "Cost",
  price: 30,
  price_unit: "EUR/kg",
  ...over,
});

describe("formatQuantity", () => {
  it("groups thousands and keeps small figures readable", () => {
    expect(formatQuantity(0.625)).toBe("0.625");
    expect(formatQuantity(5475)).toBe("5,475");
    expect(formatQuantity(0)).toBe("0");
  });

  it("never rounds a small value away to zero", () => {
    expect(formatQuantity(0.0000004)).toBe("4.000e-7");
  });

  it("goes exponential rather than blowing the column width", () => {
    expect(formatQuantity(1.848e9)).toBe("1.848e+9");
  });

  it("renders an absent value as a dash, not as zero", () => {
    expect(formatQuantity(null)).toBe("—");
    expect(formatQuantity(undefined)).toBe("—");
    expect(formatQuantity(Number.NaN)).toBe("—");
  });
});

describe("stream text helpers", () => {
  it("prints a molecule's hourly rate in the unit the database holds", () => {
    expect(rateText(component())).toBe("6 kg/h");
    expect(componentText(component())).toBe("Methane 6 kg/h");
  });

  it("dashes a rate that has no time basis", () => {
    const noBasis = component({
      value: {
        hourly: null,
        daily: null,
        yearly: null,
        unit: "kg",
        declared_unit: "kg",
        declared_basis: null,
      },
    });
    expect(rateText(noBasis)).toBe("—");
  });

  it("prints the price unit verbatim — no currency symbols", () => {
    expect(priceText(row())).toBe("30 EUR/kg");
    expect(priceText(row({ price: 14, price_unit: "EUR/MWh" }))).toBe(
      "14 EUR/MWh"
    );
    expect(priceText(row({ price: 900, price_unit: "EUR" }))).toBe("900 EUR");
    expect(priceText(row({ price: 5, price_unit: "CHF/t" }))).toBe("5 CHF/t");
  });

  it("reads NA when the gate declared no price, and drops a missing unit", () => {
    expect(priceText(row({ price: null }))).toBe("NA");
    expect(priceText(row({ price_unit: null }))).toBe("30");
  });
});

describe("connector flow", () => {
  it("prints the connector quantity and its unit, exactly as stored", () => {
    expect(flowText(row())).toBe("20 kg/h");
    expect(flowValueText(row())).toBe("20");
    expect(flowUnitText(row())).toBe("kg/h");
  });

  it("never converts the connector unit onto a common basis", () => {
    const perDay = row({ flow: { quantity: 0.09, unit: "t/day" } });
    expect(flowText(perDay)).toBe("0.09 t/day");
    // A unit with no time denominator at all is still printed as declared.
    expect(flowText(row({ flow: { quantity: 7, unit: "kW" } }))).toBe("7 kW");
  });

  it("dashes a connector that carries no quantity or no unit", () => {
    expect(flowText(row({ flow: { quantity: null, unit: "" } }))).toBe("—");
    expect(flowValueText(row({ flow: { quantity: null, unit: "" } }))).toBe("—");
    expect(flowUnitText(row({ flow: { quantity: 5, unit: "" } }))).toBe("—");
    expect(flowText(row({ flow: { quantity: 5, unit: "" } }))).toBe("5");
  });
});
