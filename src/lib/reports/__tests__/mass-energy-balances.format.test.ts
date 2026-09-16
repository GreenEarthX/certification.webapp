import {
  SPEC_COLUMNS_PER_TABLE,
  chunk,
  endpointText,
  equipmentHeading,
  formatFigure,
  kwhText,
  operandText,
  operandValueText,
  specCellText,
  specSections,
  summaryUnitText,
  summaryValueText,
  tripletText,
} from "../mass-energy-balances.format";
import { gasStream, specStream, summaryRow } from "./mass-energy-balances.fixtures";

/**
 * The row definitions behind both the preview and the PDF of the
 * Specification annex, plus the small formatters the three documents share.
 */

describe("formatFigure", () => {
  it("keeps decimals at any magnitude and groups thousands", () => {
    expect(formatFigure(1031.25)).toBe("1,031.25");
    expect(formatFigure(9033750)).toBe("9,033,750");
    expect(formatFigure(20.8333)).toBe("20.8333");
    expect(formatFigure(0.99)).toBe("0.99");
    expect(formatFigure(0)).toBe("0");
    expect(formatFigure(null)).toBe("—");
    expect(formatFigure(0.00001)).toBe("1.000e-5");
  });
});

describe("main report formatting", () => {
  it("prints the connector value and unit verbatim, dash when absent", () => {
    expect(summaryValueText(summaryRow())).toBe("15");
    expect(summaryUnitText(summaryRow())).toBe("t/day");
    const none = summaryRow({ value: null, unit: "" });
    expect(summaryValueText(none)).toBe("—");
    expect(summaryUnitText(none)).toBe("—");
  });

  it("appends the reference token only when there is one", () => {
    expect(endpointText("Shredder", "E148")).toBe("Shredder (E148)");
    expect(endpointText("Unknown", "—")).toBe("Unknown");
  });
});

describe("specification rows", () => {
  const block = {
    block: "Whole plant",
    description: "",
    streams: [specStream({ id: "S3" }), gasStream("S7")],
  };
  const sections = specSections(block);
  const rowsByKey = new Map(sections.flatMap((s) => s.rows).map((r) => [r.key, r]));

  it("declares the four sections in document order", () => {
    expect(sections.map((s) => [s.index, s.title])).toEqual([
      [null, "Stream Description"],
      [1, "Stream Characteristics"],
      [2, "Composition"],
      [3, "Stream Operational Parameters"],
    ]);
  });

  it("always has 20 composition rows and a total", () => {
    const comp = sections[2].rows;
    expect(comp).toHaveLength(21);
    expect(comp[0].label).toBe("1.");
    expect(comp[19].label).toBe("20.");
    expect(comp[20].key).toBe("total");
  });

  it("puts the unit on the attribute row, never in a stream cell", () => {
    const mass = rowsByKey.get("mass")!;
    expect(mass.label).toBe("Mass Flow Rate (min | norm | max)");
    expect(mass.unit).toBe("kg/h");
    expect(specCellText(mass.cell(block.streams[0]))).toBe("—  |  625  |  —");
    expect(rowsByKey.get("temperature")!.unit).toBe("°C");
  });

  it("keeps a missing triplet segment visibly empty", () => {
    const t = rowsByKey.get("temperature")!.cell(block.streams[0]);
    expect(t).toEqual({ kind: "triplet", min: "", norm: "15", max: "" });
    if (t.kind === "triplet") expect(tripletText(t)).toBe("—  |  15  |  —");
  });

  it("omits volume-flow rows for phases absent from the whole block", () => {
    const keys = sections[3].rows.map((r) => r.key);
    // The gas stream brings the gas rows in; nothing is liquid.
    expect(keys).toContain("vfg");
    expect(keys).toContain("vfgn");
    expect(keys).not.toContain("vfl");
    expect(keys).not.toContain("vfls");

    const solidOnly = specSections({ ...block, streams: [specStream({ id: "S3" })] });
    expect(solidOnly[3].rows.map((r) => r.key)).not.toContain("vfg");
  });

  it("labels composition cells with the carrier's own component names", () => {
    const first = rowsByKey.get("comp1")!.cell(block.streams[0]);
    expect(first).toEqual({
      kind: "composition",
      label: "Total Solids Per Fresh Matter",
      value: "33",
    });
    expect(specCellText(first)).toBe("Total Solids Per Fresh Matter\n33");
    // An unused slot is blank, not a dash: the document's "empty cell" rule.
    expect(specCellText(rowsByKey.get("comp5")!.cell(block.streams[0]))).toBe("");
  });

  it("leaves an undeclared value as an empty cell", () => {
    expect(specCellText(rowsByKey.get("enthalpy")!.cell(block.streams[0]))).toBe("");
    expect(specCellText(rowsByKey.get("opcond")!.cell(block.streams[0]))).toBe("");
    expect(specCellText(rowsByKey.get("gas")!.cell(block.streams[1]))).toBe("100");
  });

  it("splits a block into landscape-sized column groups", () => {
    const ids = Array.from({ length: 14 }, (_, i) => `S${i + 1}`);
    const groups = chunk(ids, SPEC_COLUMNS_PER_TABLE);
    expect(groups.map((g) => g.length)).toEqual([6, 6, 2]);
    expect(chunk([], 6)).toEqual([]);
  });
});

describe("energy and equation formatting", () => {
  it("groups annual kWh and dashes a missing duty", () => {
    expect(kwhText(3442680)).toBe("3,442,680");
    expect(kwhText(null)).toBe("—");
  });

  it("prints an operand with its unit and its producing equation", () => {
    expect(
      operandValueText({ label: "x", symbol: "x", value: 1031.25, unit: "kg/h", computed_in: null })
    ).toBe("1,031.25 kg/h");
    expect(
      operandValueText({ label: "x", symbol: "x", value: 0.99, unit: null, computed_in: null })
    ).toBe("0.99");
    expect(
      operandText({ label: "Substrate Blend Stream Flow", symbol: "m", value: 10.4167, unit: "kg/h", computed_in: "EQ43" })
    ).toBe("Substrate Blend Stream Flow = 10.4167 kg/h (computed in EQ43)");
    expect(
      operandText({ label: "x", symbol: "x", value: null, unit: null, computed_in: null })
    ).toBe("x = —");
  });

  it("heads a subsection with the component id and the instance name when renamed", () => {
    expect(equipmentHeading({ equipment_id: "E148", equipment: "Shredder", instance: "Shredder" })).toBe("E148 - Shredder");
    expect(equipmentHeading({ equipment_id: "E148", equipment: "Shredder", instance: "Shredder B" })).toBe("E148 - Shredder (Shredder B)");
  });
});
