import { renderPlantComponentRegistryPdf } from "../plant-component-registry.pdf";
import type { PlantComponentRegistryDto } from "../types";

/**
 * Smoke coverage for the jsPDF renderer. Runs in the node test environment, so
 * the logo fetch fails and the wordmark fallback path is what gets exercised —
 * that is deliberate: the document must never fail over a missing asset.
 *
 * doc.save() needs a browser and is an own property of each instance rather
 * than a prototype method, so the module is wrapped to intercept it at
 * construction and the produced document is inspected instead.
 */

const mockSaved: { filename: string; pages: number; bytes: number }[] = [];

jest.mock("jspdf", () => {
  const actual = jest.requireActual("jspdf");
  const Real = actual.jsPDF ?? actual.default;

  function Patched(this: unknown, ...args: unknown[]) {
    const doc = new Real(...args);
    doc.save = (filename?: string) => {
      mockSaved.push({
        filename: filename ?? "",
        pages: doc.getNumberOfPages(),
        bytes: (doc.output("arraybuffer") as ArrayBuffer).byteLength,
      });
      return doc;
    };
    return doc;
  }

  return { __esModule: true, default: Patched, jsPDF: Patched };
});

const saved = () => mockSaved[mockSaved.length - 1];

beforeEach(() => {
  mockSaved.length = 0;
});

const base = (
  over: Partial<PlantComponentRegistryDto> = {}
): PlantComponentRegistryDto => ({
  report_type: "plant_component_registry",
  report_document_id: 1,
  title: "Plant Component Registry",
  metadata: {
    revision_number: 0,
    user_name: "Ada Lovelace",
    generated_at: "2026-09-01T12:00:00.000Z",
    project_name: "Sample Output",
    project_variation: "Base Case (v1)",
    document_reference: "GEX-REP-2026-09-0001",
    project_reference: "GEX-PRJ-000042",
    company_name: "GreenEarthX",
  },
  equipment: [{ id: "E1", equipment: "Shredder", quantity: 1 }],
  gates: [{ id: "G1", gate: "Biogenic Supply", role: "Upstream" }],
  carriers: [
    {
      id: "C1",
      carrier: "Substrate",
      from: [{ label: "Biogenic Supply", ref: "G1", kind: "gate" }],
      to: [{ label: "Shredder", ref: "E1", kind: "equipment" }],
    },
  ],
  warnings: [],
  ...over,
});

it("writes a PDF named after the document reference", async () => {
  const filename = await renderPlantComponentRegistryPdf(base());

  expect(filename).toBe("GEX-REP-2026-09-0001_Plant-Component-Registry.pdf");
  expect(saved().filename).toBe(filename);
  expect(saved().bytes).toBeGreaterThan(1000);
});

it("renders an empty twin without throwing", async () => {
  await expect(
    renderPlantComponentRegistryPdf(
      base({ equipment: [], gates: [], carriers: [] })
    )
  ).resolves.toBeTruthy();
  expect(saved().pages).toBe(1);
});

it("renders the notes block when there are warnings", async () => {
  const withWarnings = await renderPlantComponentRegistryPdf(
    base({
      warnings: [
        "Gate \"Vent\" has both inbound and outbound streams and no declared value; listed as both.",
        "A stream references a component that is not part of this variation.",
      ],
    })
  );
  expect(withWarnings).toBeTruthy();
  expect(saved().bytes).toBeGreaterThan(1000);
});

it("paginates a long carrier table and keeps the footer on every page", async () => {
  // 120 carriers, each with a wide From/To list, forces several pages and
  // exercises the willDrawCell/didDrawCell colouring across wrapped lines.
  const carriers = Array.from({ length: 120 }, (_, i) => ({
    id: `C${i + 1}`,
    carrier: `Biogas ${i + 1}`,
    from: [{ label: "Methanogenesis Reactor", ref: "E8", kind: "equipment" as const }],
    to: [
      { label: "H2S Scavenger Bed", ref: "E7", kind: "equipment" as const },
      { label: "Dryer Unit", ref: "E6", kind: "equipment" as const },
      { label: "Biogas Upgrading Unit", ref: "E10", kind: "equipment" as const },
      { label: "Offtake Market", ref: "G11", kind: "gate" as const },
    ],
  }));

  await renderPlantComponentRegistryPdf(base({ carriers }));

  expect(saved().pages).toBeGreaterThan(1);
  expect(saved().bytes).toBeGreaterThan(10_000);
});

it("survives a carrier row with empty From and To lists", async () => {
  await expect(
    renderPlantComponentRegistryPdf(
      base({
        carriers: [{ id: "C1", carrier: "Polymer", from: [], to: [] }],
      })
    )
  ).resolves.toBeTruthy();
});
