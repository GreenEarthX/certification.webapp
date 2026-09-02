import { REPORT_REGISTRY, REPORT_STAGES, getReportDefinition } from "../registry";

/**
 * Guard rails on the report catalogue, so reports 2 and 3 cannot be marked
 * available without actually being implemented.
 */
describe("report registry", () => {
  it("exposes three reports with unique ids", () => {
    expect(REPORT_REGISTRY).toHaveLength(3);
    const ids = REPORT_REGISTRY.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every available report a full implementation", () => {
    const available = REPORT_REGISTRY.filter((r) => r.status === "available");
    expect(available.length).toBeGreaterThan(0);

    for (const def of available) {
      expect(typeof def.generate).toBe("function");
      expect(def.Preview).toBeDefined();
      expect(typeof def.toPdf).toBe("function");
      expect(def.stages?.length).toBeGreaterThan(0);
    }
  });

  it("gives every coming-soon report no implementation and a note", () => {
    const soon = REPORT_REGISTRY.filter((r) => r.status === "coming_soon");
    expect(soon.length).toBeGreaterThan(0);

    for (const def of soon) {
      expect(def.generate).toBeUndefined();
      expect(def.Preview).toBeUndefined();
      expect(def.toPdf).toBeUndefined();
      expect(def.comingSoonNote).toBeTruthy();
    }
  });

  it("gives every report the copy the picker card renders", () => {
    for (const def of REPORT_REGISTRY) {
      expect(def.title).toBeTruthy();
      expect(def.subtitle).toBeTruthy();
      expect(def.description).toBeTruthy();
      expect(def.icon).toBeDefined();
      expect(def.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("has strictly increasing stage weights ending at 100", () => {
    for (let i = 1; i < REPORT_STAGES.length; i++) {
      expect(REPORT_STAGES[i].weight).toBeGreaterThan(
        REPORT_STAGES[i - 1].weight
      );
    }
    expect(REPORT_STAGES[REPORT_STAGES.length - 1].weight).toBe(100);
    expect(REPORT_STAGES[0].weight).toBeGreaterThan(0);
  });

  it("gives every stage a label for the progress caption", () => {
    for (const s of REPORT_STAGES) {
      expect(s.key).toBeTruthy();
      expect(s.label).toBeTruthy();
    }
  });

  it("looks a report up by id", () => {
    expect(getReportDefinition("plant_component_registry")?.status).toBe(
      "available"
    );
    expect(getReportDefinition("mass_balance_summary")?.status).toBe(
      "coming_soon"
    );
  });
});
