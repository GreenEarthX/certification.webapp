import { renderMassEnergyBalancesEquationsPdf } from "../mass-energy-balances-equations.pdf";
import { renderMassEnergyBalancesSpecificationPdf } from "../mass-energy-balances-specification.pdf";
import { renderMassEnergyBalancesPdf } from "../mass-energy-balances.pdf";
import {
  card,
  equations,
  gasStream,
  mainReport,
  specStream,
  specification,
  summaryRow,
} from "./mass-energy-balances.fixtures";

/**
 * Smoke coverage for the three Mass & Energy Balances renderers, mirroring the
 * Process Flow Operations test: node environment, so the logo fetch fails and
 * the wordmark fallback is exercised — deliberately, since a document must
 * never fail over a missing asset.
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

describe("renderMassEnergyBalancesPdf", () => {
  it("saves a landscape document named after the reference", async () => {
    const filename = await renderMassEnergyBalancesPdf(mainReport());
    expect(filename).toBe("GEX-REP-2026-09-0025_Mass-Energy-Balances.pdf");
    expect(saved().pages).toBe(1);
    expect(saved().bytes).toBeGreaterThan(1000);
  });

  it("paginates a long stream table", async () => {
    const streams = Array.from({ length: 80 }, (_, i) => summaryRow({ id: `S${i + 1}` }));
    await renderMassEnergyBalancesPdf(mainReport(streams));
    expect(saved().pages).toBeGreaterThan(1);
  });

  it("renders an empty variation and its notes", async () => {
    await renderMassEnergyBalancesPdf(mainReport([], ["This variation has no streams; the table is empty."]));
    expect(saved().pages).toBe(1);
  });
});

describe("renderMassEnergyBalancesSpecificationPdf", () => {
  it("saves the annex", async () => {
    const filename = await renderMassEnergyBalancesSpecificationPdf(specification());
    expect(filename).toBe("GEX-REP-2026-09-0025_Mass-Energy-Balances_Specification.pdf");
    expect(saved().bytes).toBeGreaterThan(1000);
  });

  it("splits a wide block into several column groups across pages", async () => {
    const streams = Array.from({ length: 14 }, (_, i) =>
      i % 2 ? gasStream(`S${i + 1}`) : specStream({ id: `S${i + 1}` })
    );
    await renderMassEnergyBalancesSpecificationPdf(specification(streams));
    // 3 tables of ~35 rows each cannot share one landscape page.
    expect(saved().pages).toBeGreaterThan(2);
  });

  it("renders with no material streams at all", async () => {
    await renderMassEnergyBalancesSpecificationPdf(
      specification([], ["No block flow diagram is defined for this variation."])
    );
    expect(saved().pages).toBeGreaterThanOrEqual(1);
    expect(saved().bytes).toBeGreaterThan(1000);
  });
});

describe("renderMassEnergyBalancesEquationsPdf", () => {
  it("saves the annex in portrait", async () => {
    const filename = await renderMassEnergyBalancesEquationsPdf(equations());
    expect(filename).toBe("GEX-REP-2026-09-0025_Mass-Energy-Balances_Equations.pdf");
    expect(saved().pages).toBe(1);
    expect(saved().bytes).toBeGreaterThan(1000);
  });

  it("never splits a card: many cards flow onto new pages", async () => {
    const cards = Array.from({ length: 40 }, (_, i) => card({ id: `EQ${i + 1}` }));
    const body = equations([
      {
        id: "Cat1",
        chapter: 1,
        category: "Conservation (mass)",
        equipment: [
          { equipment_id: "E148", equipment: "Shredder", instance_id: "57", instance: "Shredder", equations: cards },
        ],
      },
    ]);
    await renderMassEnergyBalancesEquationsPdf(body);
    expect(saved().pages).toBeGreaterThan(2);
  });

  it("renders an annex with no complete equation", async () => {
    await renderMassEnergyBalancesEquationsPdf(
      equations([], ["E148 Shredder has never been computed, so its 7 equations are omitted."])
    );
    expect(saved().pages).toBe(1);
  });
});
