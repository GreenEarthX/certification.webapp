import {
  buildStreamEconomicsDiagram,
  buildSystemBoundaryDiagram,
  type Primitive,
  type TextPrim,
} from "../boundary-diagram";
import { DIAGRAM } from "../format";
import type {
  BoundaryStreamRow,
  ReportMetadata,
  StreamComponent,
} from "../types";

/**
 * The layout engine is the only place either illustration decides what is drawn
 * and where, so the report's rules are pinned here rather than in the SVG or
 * the PDF renderer.
 */

const METADATA: ReportMetadata = {
  revision_number: 0,
  user_name: "Ada Lovelace",
  generated_at: "2026-09-01T12:00:00.000Z",
  project_name: "test",
  project_variation: "Base Case (v1)",
  document_reference: "GEX-REP-2026-09-0001",
  project_reference: "GEX-PRJ-000042",
  company_name: "GreenEarthX",
};

/** One molecule at a flat hourly rate, in the unit the database records. */
const component = (
  label: string,
  hourly: number | null,
  unit = "kg"
): StreamComponent => ({
  field_name: `${label} Mass Flow Rate`,
  label,
  value: {
    hourly,
    daily: hourly === null ? null : hourly * 24,
    yearly: hourly === null ? null : hourly * 8760,
    unit,
    declared_unit: `${unit}/h`,
    declared_basis: hourly === null ? null : "hour",
  },
});

const stream = (over: Partial<BoundaryStreamRow> = {}): BoundaryStreamRow => ({
  id: "S1",
  direction: "upstream",
  gate_id: "G1",
  gate: "Biogenic Supply",
  carrier: "Maize Silage",
  flow: { quantity: 0.625, unit: "t/h" },
  components: [component("Volatile Solids", 0.625)],
  economic_impact: "Cost",
  price: 30,
  price_unit: "EUR/kg",
  ...over,
});

const texts = (items: Primitive[]): TextPrim[] =>
  items.filter((p): p is TextPrim => p.kind === "text");

const textOf = (items: Primitive[]) => texts(items).map((t) => t.text);

const colourOf = (items: Primitive[], value: string) =>
  texts(items).find((t) => t.text === value)?.color;

describe("buildSystemBoundaryDiagram", () => {
  it("draws every stream, whatever its economic impact", () => {
    const d = buildSystemBoundaryDiagram(
      [
        stream({ id: "S1", carrier: "Maize Silage" }),
        stream({
          id: "S2",
          direction: "downstream",
          carrier: "Methane",
          economic_impact: "Revenue",
        }),
        stream({
          id: "S3",
          direction: "downstream",
          carrier: "Tail Gas",
          economic_impact: "Neutral",
          price: null,
        }),
      ],
      METADATA
    );

    for (const carrier of ["Maize Silage", "Methane", "Tail Gas"]) {
      expect(textOf(d.items)).toContain(carrier);
    }
    expect(d.omitted).toEqual({ neutral: 0, unpriced: 0 });
  });

  it("colours a stream by its economic impact, not its direction", () => {
    const d = buildSystemBoundaryDiagram(
      [
        // A downstream stream that costs money to dispose of.
        stream({ direction: "downstream", carrier: "Digestate" }),
        stream({
          direction: "downstream",
          carrier: "Methane",
          economic_impact: "Revenue",
        }),
        stream({
          direction: "upstream",
          carrier: "Process Water",
          economic_impact: "Neutral",
        }),
      ],
      METADATA
    );

    expect(colourOf(d.items, "Digestate")).toBe(DIAGRAM.cost);
    expect(colourOf(d.items, "Methane")).toBe(DIAGRAM.revenue);
    expect(colourOf(d.items, "Process Water")).toBe(DIAGRAM.neutral);
  });

  it("lists every molecule the carrier declares a flow for", () => {
    const d = buildSystemBoundaryDiagram(
      [
        stream({
          carrier: "Biogas",
          components: [
            component("Methane", 6),
            component("Hydrogen", 2132),
            component("Carbon Dioxide", 133),
          ],
        }),
      ],
      METADATA
    );

    // One arrow for the carrier, one label line per molecule.
    expect(d.items.filter((p) => p.kind === "arrowhead")).toHaveLength(1);
    expect(textOf(d.items)).toEqual(
      expect.arrayContaining([
        "Biogas",
        "Methane 6 kg/h",
        "Hydrogen 2,132 kg/h",
        "Carbon Dioxide 133 kg/h",
      ])
    );
  });

  it("prints the hourly rate, and a dash when there is no time basis", () => {
    const d = buildSystemBoundaryDiagram(
      [
        stream(),
        stream({
          id: "S2",
          carrier: "Additive",
          components: [component("Additive", null)],
        }),
      ],
      METADATA
    );

    expect(textOf(d.items)).toContain("Volatile Solids 0.625 kg/h");
    // Never substituted with a daily or yearly figure.
    expect(textOf(d.items)).toContain("Additive —");
  });

  it("shows a dash for a carrier that declares no flow at all", () => {
    const d = buildSystemBoundaryDiagram(
      [stream({ carrier: "Rice Straw", components: [] })],
      METADATA
    );

    expect(textOf(d.items)).toContain("Rice Straw");
    expect(textOf(d.items)).toContain("—");
  });

  it("summarises molecules past the per-stream cap", () => {
    const many = Array.from({ length: 7 }, (_, i) =>
      component(`Molecule ${i + 1}`, i + 1)
    );
    const d = buildSystemBoundaryDiagram(
      [stream({ components: many })],
      METADATA
    );

    expect(textOf(d.items)).toContain("Molecule 4 4 kg/h");
    expect(textOf(d.items)).not.toContain("Molecule 5 5 kg/h");
    expect(textOf(d.items)).toContain("+3 more");
  });

  it("carries the legend and the project footer", () => {
    const d = buildSystemBoundaryDiagram([stream()], METADATA);
    const labels = textOf(d.items);

    expect(labels).toEqual(expect.arrayContaining(["COST", "REVENUE", "NEUTRAL"]));
    expect(labels).toContain("test · GreenEarthX");
  });

  it("summarises the remainder rather than overflowing the page", () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      stream({ id: `S${i + 1}`, carrier: `Feed ${i + 1}` })
    );
    const d = buildSystemBoundaryDiagram(many, METADATA);

    expect(textOf(d.items)).toContain("+6 more upstream");
    expect(textOf(d.items)).not.toContain("Feed 20");
  });

  it("says so when nothing crosses the boundary", () => {
    const d = buildSystemBoundaryDiagram([], METADATA);
    expect(textOf(d.items)).toContain("No streams cross the system boundary");
  });

  it("keeps every primitive inside the canvas", () => {
    const d = buildSystemBoundaryDiagram(
      [stream(), stream({ id: "S2", direction: "downstream" })],
      METADATA
    );

    for (const p of d.items) {
      const x = p.kind === "line" ? Math.max(p.x1, p.x2) : p.x;
      const y = p.kind === "line" ? Math.max(p.y1, p.y2) : p.y;
      expect(y).toBeLessThanOrEqual(d.height);
      if (p.kind === "rect") expect(p.x + p.w).toBeLessThanOrEqual(d.width);
      else expect(x).toBeLessThanOrEqual(d.width);
    }
  });
});

describe("buildStreamEconomicsDiagram", () => {
  it("leaves out neutral and unpriced streams, and counts both", () => {
    const d = buildStreamEconomicsDiagram([
      stream({ carrier: "Maize Silage" }),
      stream({
        id: "S2",
        direction: "downstream",
        carrier: "Tail Gas",
        economic_impact: "Neutral",
        price: null,
      }),
      stream({
        id: "S3",
        carrier: "Enzymes",
        economic_impact: "Cost",
        price: null,
      }),
    ]);

    expect(textOf(d.items)).toContain("Maize Silage");
    expect(textOf(d.items)).not.toContain("Tail Gas");
    expect(textOf(d.items)).not.toContain("Enzymes");
    expect(d.omitted).toEqual({ neutral: 1, unpriced: 1 });
    expect(textOf(d.items)).toContain(
      "1 neutral stream not shown · 1 stream with no declared economic value not shown"
    );
  });

  it("groups cards by direction and colours them by impact", () => {
    const d = buildStreamEconomicsDiagram([
      stream({ carrier: "Maize Silage" }),
      // A downstream cost belongs on the products side, coloured as a cost.
      stream({ id: "S2", direction: "downstream", carrier: "Digestate" }),
      stream({
        id: "S3",
        direction: "downstream",
        carrier: "Methane",
        economic_impact: "Revenue",
        price: 0.63,
        price_unit: "EUR/Nm3",
      }),
    ]);

    const cardX = (label: string) =>
      texts(d.items).find((t) => t.text === label)!.x;

    expect(cardX("Maize Silage")).toBeLessThan(d.width / 2);
    expect(cardX("Digestate")).toBeGreaterThan(d.width / 2);
    expect(colourOf(d.items, "Digestate")).toBe(DIAGRAM.cost);
    expect(colourOf(d.items, "Methane")).toBe(DIAGRAM.revenue);
  });

  it("prints the unit price with the currency symbol", () => {
    const d = buildStreamEconomicsDiagram([stream()]);
    // Verbatim from the database — no currency symbol substitution.
    expect(textOf(d.items)).toContain("30 EUR/kg");
    expect(textOf(d.items)).toContain("Volatile Solids 0.625 kg/h");
  });

  it("draws exactly two aggregated arrows", () => {
    const d = buildStreamEconomicsDiagram([
      stream(),
      stream({ id: "S2", carrier: "Water" }),
      stream({
        id: "S3",
        direction: "downstream",
        carrier: "Methane",
        economic_impact: "Revenue",
      }),
    ]);

    expect(d.items.filter((p) => p.kind === "arrowhead")).toHaveLength(2);
  });

  it("keeps an empty container rather than dropping it", () => {
    const d = buildStreamEconomicsDiagram([stream()]);
    expect(textOf(d.items)).toContain("PRODUCTS & BY-PRODUCTS");
    expect(textOf(d.items)).toContain("No priced streams");
    expect(d.items.filter((p) => p.kind === "arrowhead")).toHaveLength(2);
  });

  it("summarises cards past the per-container cap", () => {
    const many = Array.from({ length: 14 }, (_, i) =>
      stream({ id: `S${i + 1}`, carrier: `Feed ${i + 1}` })
    );
    const d = buildStreamEconomicsDiagram(many);
    expect(textOf(d.items)).toContain("+4 more");
  });
});
