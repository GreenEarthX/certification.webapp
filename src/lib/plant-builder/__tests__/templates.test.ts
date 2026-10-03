import {
  EMPTY_TEMPLATE_FILTERS,
  filterTemplates,
  hasActiveFilters,
  layoutTemplateDiagram,
  optionLabel,
  templateStats,
} from "../templates";
import type { TemplateDto } from "@/services/plant-builder/templates";

function template(overrides: Partial<TemplateDto>): TemplateDto {
  return {
    id: 1,
    name: "Biogas AD",
    description: "Anaerobic digestion chain",
    category: "biogas",
    pathway: "biogenic",
    is_public: true,
    created_by: 1,
    creator: { id: 1, email: "olaf@example.com", name: "Olaf" },
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("optionLabel", () => {
  const options = [{ value: "biogas", label: "Biogas / Biomethane" }];

  it("maps a value to its label", () => {
    expect(optionLabel(options, "biogas")).toBe("Biogas / Biomethane");
  });

  it("falls back to the raw value, and to null when empty", () => {
    expect(optionLabel(options, "unknown")).toBe("unknown");
    expect(optionLabel(options, null)).toBeNull();
  });
});

describe("templateStats", () => {
  it("counts by type and dedupes v1 edges stored once per endpoint", () => {
    const stats = templateStats(
      template({
        template_json: {
          components: [
            { id: 1, type: "equipment" },
            { id: 2, type: "carrier" },
            { id: 3, type: "gate" },
          ],
          connections: [
            { from: 1, to: 2 },
            { from: 1, to: 2 },
            { from: 2, to: 3, port_id: "P1" },
          ],
        },
      })
    );
    expect(stats).toEqual({
      components: 3,
      equipment: 1,
      carriers: 1,
      gates: 1,
      connections: 2,
    });
  });

  it("is all zeros without a topology", () => {
    expect(templateStats(template({})).components).toBe(0);
  });
});

describe("filterTemplates", () => {
  const library = [
    template({ id: 1, name: "Biogas AD", category: "biogas", pathway: "biogenic" }),
    template({ id: 2, name: "PEM H2", category: "green_hydrogen", pathway: "synthetic", description: null }),
    template({ id: 3, name: "UCO to SAF", category: "saf", pathway: "thermochemical", description: "Used cooking oil hydroprocessing", creator: { id: 9, email: "maryem@example.com", name: null } }),
  ];
  const mine = new Set([2]);
  const ids = (list: TemplateDto[]) => list.map((t) => t.id);

  it("returns everything with empty filters", () => {
    expect(ids(filterTemplates(library, EMPTY_TEMPLATE_FILTERS, mine))).toEqual([1, 2, 3]);
  });

  it("scopes to the caller's own templates", () => {
    expect(ids(filterTemplates(library, { ...EMPTY_TEMPLATE_FILTERS, scope: "mine" }, mine))).toEqual([2]);
  });

  it("combines category and pathway", () => {
    const filters = { ...EMPTY_TEMPLATE_FILTERS, category: "biogas", pathway: "synthetic" };
    expect(filterTemplates(library, filters, mine)).toEqual([]);
  });

  it("searches name, description and creator, case-insensitively", () => {
    const search = (term: string) =>
      ids(filterTemplates(library, { ...EMPTY_TEMPLATE_FILTERS, search: term }, mine));
    expect(search("pem")).toEqual([2]);
    expect(search("DIGESTION")).toEqual([1]);
    expect(search("maryem")).toEqual([3]);
  });

  it("does not count the scope tab as an active filter", () => {
    expect(hasActiveFilters({ ...EMPTY_TEMPLATE_FILTERS, scope: "mine" })).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_TEMPLATE_FILTERS, search: " x " })).toBe(true);
  });
});

describe("layoutTemplateDiagram", () => {
  it("returns null when there is nothing to draw", () => {
    expect(layoutTemplateDiagram(undefined)).toBeNull();
    expect(layoutTemplateDiagram({ components: [] })).toBeNull();
  });

  it("keeps saved positions and pads the view box around the nodes", () => {
    const layout = layoutTemplateDiagram({
      components: [
        { id: 1, type: "equipment", position: { x: 0, y: 0 } },
        { id: 2, type: "carrier", position: { x: 500, y: 0 } },
      ],
    })!;
    expect(layout.nodes.map((n) => [n.x, n.y])).toEqual([[0, 0], [500, 0]]);
    // equipment is 224 wide from x=0; carrier is 144 wide from x=500; 64 padding.
    expect(layout.viewBox).toEqual({ x: -64, y: -64, width: 644 + 128, height: 144 + 128 });
  });

  it("falls back to a grid when any position is missing", () => {
    const layout = layoutTemplateDiagram({
      components: [
        { id: 1, type: "equipment", position: { x: 900, y: 900 } },
        { id: 2, type: "carrier" },
        { id: 3, type: "gate" },
        { id: 4 },
      ],
    })!;
    expect(layout.nodes.map((n) => [n.x, n.y])).toEqual([
      [0, 0],
      [320, 0],
      [0, 340],
      [320, 340],
    ]);
    expect(layout.nodes[3].kind).toBe("other");
  });

  it("clips edges to node borders so the arrowhead is not hidden", () => {
    const layout = layoutTemplateDiagram({
      components: [
        // equipment 224x144 -> centre (112, 72); carrier r=72 at centre (572, 72)
        { id: "a", type: "equipment", position: { x: 0, y: 0 } },
        { id: "b", type: "carrier", position: { x: 500, y: 0 } },
      ],
      connections: [{ from: "a", to: "b" }],
    })!;
    expect(layout.edges).toHaveLength(1);
    const [edge] = layout.edges;
    expect(edge.x1).toBeCloseTo(224); // right edge of the equipment box
    expect(edge.x2).toBeCloseTo(500); // left of the carrier circle
    expect(edge.y1).toBeCloseTo(72);
    expect(edge.y2).toBeCloseTo(72);
  });

  it("skips dangling and self-referencing edges", () => {
    const layout = layoutTemplateDiagram({
      components: [{ id: 1, type: "equipment", position: { x: 0, y: 0 } }],
      connections: [
        { from: 1, to: 99 },
        { from: 1, to: 1 },
      ],
    })!;
    expect(layout.edges).toEqual([]);
  });
});
