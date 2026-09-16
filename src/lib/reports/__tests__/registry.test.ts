import {
  REPORT_GROUPS,
  REPORT_REGISTRY,
  REPORT_STAGES,
  getReportDefinition,
  getReportGroup,
} from "../registry";

/**
 * Guard rails on the report catalogue, so a report cannot be marked available
 * without actually being implemented.
 */
describe("report registry", () => {
  it("exposes five documents with unique ids", () => {
    expect(REPORT_REGISTRY).toHaveLength(5);
    const ids = REPORT_REGISTRY.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("groups the Mass & Energy Balances main report with its two annexes", () => {
    const group = getReportGroup("mass_energy_balances");
    expect(group).toBeDefined();
    const members = REPORT_REGISTRY.filter((r) => r.group === "mass_energy_balances");
    expect(members.map((m) => [m.id, m.groupLabel])).toEqual([
      ["mass_energy_balances", "Main Report"],
      ["mass_energy_balances_specification", "Annex 1: Specification"],
      ["mass_energy_balances_equations", "Annex 2: Equations"],
    ]);
    // Every grouped document is generated on its own, with its own reference.
    for (const m of members) expect(m.status).toBe("available");
  });

  it("points every grouped report at a declared group", () => {
    for (const def of REPORT_REGISTRY) {
      if (!def.group) continue;
      expect(REPORT_GROUPS.some((g) => g.id === def.group)).toBe(true);
      expect(def.groupLabel).toBeTruthy();
    }
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
    // None today; the guard stays for the next placeholder.
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
    expect(getReportDefinition("process_flow_operations")?.status).toBe(
      "available"
    );
    expect(getReportDefinition("mass_energy_balances_equations")?.status).toBe(
      "available"
    );
    expect(REPORT_REGISTRY.some((r) => r.status !== "available")).toBe(false);
  });
});
