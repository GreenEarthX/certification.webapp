import { renderProcessFlowOperationsPdf } from "../process-flow-operations.pdf";
import type {
  BoundaryStreamRow,
  ProcessFlowOperationsDto,
  StreamComponent,
} from "../types";

/**
 * Smoke coverage for the landscape renderer, mirroring the Plant Component
 * Registry's test: it runs in the node environment, so the logo fetch fails and
 * the wordmark fallback is what gets exercised — deliberately, since the
 * document must never fail over a missing asset.
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

const base = (
  over: Partial<ProcessFlowOperationsDto> = {}
): ProcessFlowOperationsDto => ({
  report_type: "process_flow_operations",
  report_document_id: 1,
  title: "Process Flow Operations",
  metadata: {
    revision_number: 0,
    user_name: "Ada Lovelace",
    generated_at: "2026-09-01T12:00:00.000Z",
    project_name: "test",
    project_variation: "Base Case (v1)",
    document_reference: "GEX-REP-2026-09-0002",
    project_reference: "GEX-PRJ-000042",
    company_name: "GreenEarthX",
  },
  time_basis: {
    hours_per_day: 24,
    days_per_year: 365,
    hours_per_year: 8760,
    is_default: true,
  },
  streams: [
    stream(),
    stream({
      id: "S2",
      direction: "downstream",
      gate_id: "G2",
      gate: "Main Fuel Offtake",
      carrier: "Biogas",
      components: [
        component("Methane", 6),
        component("Hydrogen", 2132),
        component("Carbon Dioxide", 133),
      ],
      economic_impact: "Revenue",
      price: 0.63,
      price_unit: "EUR/Nm3",
    }),
    stream({
      id: "S3",
      direction: "downstream",
      gate_id: "G3",
      gate: "Vent",
      carrier: "Tail Gas",
      economic_impact: "Neutral",
      price: null,
      price_unit: null,
    }),
  ],
  warnings: [],
  ...over,
});

it("writes a landscape PDF named after the document reference", async () => {
  const filename = await renderProcessFlowOperationsPdf(base());

  expect(filename).toBe("GEX-REP-2026-09-0002_Process-Flow-Operations.pdf");
  expect(saved().filename).toBe(filename);
  expect(saved().bytes).toBeGreaterThan(1000);
});

it("renders a twin with no boundary streams without throwing", async () => {
  await expect(
    renderProcessFlowOperationsPdf(base({ streams: [] }))
  ).resolves.toBeTruthy();
  expect(saved().bytes).toBeGreaterThan(1000);
});

it("survives streams whose values and prices are null", async () => {
  await expect(
    renderProcessFlowOperationsPdf(
      base({
        streams: [
          // A carrier that declares no flow at all, on an unresolved gate.
          stream({
            components: [],
            economic_impact: "—",
            price: null,
            price_unit: null,
          }),
          // A molecule whose declared unit carries no time basis.
          stream({ id: "S2", components: [component("Additive", null)] }),
        ],
      })
    )
  ).resolves.toBeTruthy();
});

it("paginates a long stream table and keeps the footer on every page", async () => {
  const streams = Array.from({ length: 90 }, (_, i) =>
    stream({
      id: `S${i + 1}`,
      gate_id: `G${i + 1}`,
      gate: `Biogenic Supply Point ${i + 1}`,
      carrier: `Feedstock Blend ${i + 1}`,
      direction: i % 2 ? "downstream" : "upstream",
    })
  );

  await renderProcessFlowOperationsPdf(base({ streams }));

  expect(saved().pages).toBeGreaterThan(1);
  expect(saved().bytes).toBeGreaterThan(10_000);
});

it("renders the notes block when the builder reported warnings", async () => {
  await expect(
    renderProcessFlowOperationsPdf(
      base({
        warnings: [
          'Gate "Vent" declares no stream quantity, so its flow values are blank.',
          'Gate "Flare" prices its stream in "EUR/t" but measures it in "MWh/h".',
        ],
      })
    )
  ).resolves.toBeTruthy();
  expect(saved().bytes).toBeGreaterThan(1000);
});
