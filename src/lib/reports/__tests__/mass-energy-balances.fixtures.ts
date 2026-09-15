import type {
  EquationCard,
  MassEnergyBalancesDto,
  MassEnergyBalancesEquationsDto,
  MassEnergyBalancesSpecificationDto,
  ReportMetadata,
  SpecTriplet,
  StreamSpecification,
  StreamSummaryRow,
} from "../types";

/**
 * Fixtures shared by the Mass & Energy Balances tests, shaped like the
 * backend's output for the reference biogas twin.
 */

export const METADATA: ReportMetadata = {
  revision_number: 0,
  user_name: "Ada Lovelace",
  generated_at: "2026-09-15T12:00:00.000Z",
  project_name: "Sample Output",
  project_variation: "Base Case (v1)",
  document_reference: "GEX-REP-2026-09-0025",
  project_reference: "GEX-PRJ-000009",
  company_name: "GreenEarthX",
};

export const summaryRow = (over: Partial<StreamSummaryRow> = {}): StreamSummaryRow => ({
  id: "S14",
  kind: "material",
  carrier: "Maize Silage",
  carrier_id: "C3",
  from: "Biomass Supply",
  from_id: "G3",
  to: "Shredder",
  to_id: "E148",
  value: 15,
  unit: "t/day",
  ...over,
});

export const mainReport = (
  streams: StreamSummaryRow[] = [
    summaryRow(),
    summaryRow({ id: "S2", kind: "electricity", carrier: "Electricity", carrier_id: "C2", from: "Power Supply", from_id: "G1", value: 20.8333, unit: "kW" }),
    summaryRow({ id: "S23", carrier: "Biogas", carrier_id: "C10", from: "Methanogenesis Reactor", from_id: "E208", to: "H2S Scavenger Bed", to_id: "E58", value: null, unit: "" }),
  ],
  warnings: string[] = []
): MassEnergyBalancesDto => ({
  report_type: "mass_energy_balances",
  report_document_id: 1,
  title: "Mass & Energy Balances",
  metadata: METADATA,
  streams,
  warnings,
});

const empty = (unit: string): SpecTriplet => ({ min: null, norm: null, max: null, unit });

export const specStream = (
  over: Partial<StreamSpecification> & { id: string }
): StreamSpecification => ({
  description: { carrier: "Maize Silage", from: "Biomass Supply", to: "Shredder" },
  characteristics: {
    carrier: "Maize Silage",
    carrier_id: "C3",
    operating_conditions: null,
    physical_state: "Solid",
    solid_fraction: 100,
    liquid_fraction: null,
    gas_fraction: null,
  },
  composition: {
    rows: Array.from({ length: 20 }, (_, i) => ({
      index: i + 1,
      label: i === 0 ? "Total Solids Per Fresh Matter" : i === 1 ? "Moisture Content Per Fresh Matter" : null,
      value: i === 0 ? 33 : i === 1 ? 67 : null,
    })),
    total: 100,
  },
  operational: {
    operating_mode: null,
    mass_flow_rate: { min: null, norm: 625, max: null, unit: "kg/h" },
    volume_flow_rate_liquid: null,
    volume_flow_rate_liquid_std: null,
    volume_flow_rate_gas: null,
    volume_flow_rate_gas_normal: null,
    pressure: empty("bar(g)"),
    temperature: { min: null, norm: 15, max: null, unit: "°C" },
    enthalpy: { value: null, unit: "kJ/kg" },
    molecular_weight: { value: null, unit: "kg/kmol" },
    liquid_density: { value: null, unit: "kg/m3" },
    vapor_density: { value: null, unit: "kg/m3" },
    boiling_point: { value: null, unit: "°C" },
    melting_point: { value: null, unit: "°C" },
    pour_point: { value: null, unit: "°C" },
    notes: null,
  },
  ...over,
});

export const gasStream = (id: string): StreamSpecification => {
  const s = specStream({ id });
  s.description = { carrier: "Biogas", from: "Reactor", to: "Offtake Market" };
  s.characteristics = {
    ...s.characteristics,
    carrier: "Biogas",
    carrier_id: "C6",
    physical_state: "Gas",
    solid_fraction: null,
    gas_fraction: 100,
  };
  s.operational = {
    ...s.operational,
    mass_flow_rate: { min: null, norm: 120, max: null, unit: "kg/h" },
    volume_flow_rate_gas: empty("m3/h"),
    volume_flow_rate_gas_normal: empty("Nm3/h"),
    pressure: { min: null, norm: 0.05, max: null, unit: "bar(g)" },
    vapor_density: { value: 1.15, unit: "kg/m3" },
  };
  return s;
};

export const specification = (
  streams: StreamSpecification[] = [specStream({ id: "S3" }), gasStream("S7")],
  warnings: string[] = []
): MassEnergyBalancesSpecificationDto => ({
  report_type: "mass_energy_balances_specification",
  report_document_id: 2,
  title: "Mass & Energy Balances: Specification",
  metadata: METADATA,
  time_basis: { hours_per_day: 24, days_per_year: 365, hours_per_year: 8760, is_default: true },
  blocks: streams.length
    ? [{ block: "Whole plant", description: "All material streams of the variation.", streams }]
    : [],
  energy: {
    electricity: [
      { stream_id: "S1", equipment: "Shredder", equipment_id: "E148", consumption_kw: 20.83, annual_kwh: 182471 },
      { stream_id: "S2", equipment: "Reactor", equipment_id: "E169", consumption_kw: null, annual_kwh: null },
    ],
    heat: [
      { stream_id: "S6", from: "Heat Supply", from_id: "G12", to: "Reactor", to_id: "E169", heat_duty_kw: 393, annual_kwh: 3442680 },
    ],
  },
  warnings,
});

export const card = (over: Partial<EquationCard> = {}): EquationCard => ({
  id: "EQ43",
  labelled_expression:
    "Substrate Blend Stream Flow = Combined Stream Flow (Maize Silage, Poultry Manure, Grass Silage) * Mass Recovery Efficiency",
  expression: "m_shredded_out = m_feedstock_in * f_retention",
  description: "Shredded feedstock outlet mass flow equals inlet feedstock mass flow times the mass retention factor.",
  equation_type: "stream_split",
  output: { label: "Substrate Blend Stream Flow", symbol: "m_shredded_out", value: 1031.25, unit: "kg/h", computed_in: null },
  inputs: [
    { label: "Combined Stream Flow (Maize Silage, Poultry Manure, Grass Silage)", symbol: "m_feedstock_in", value: 1041.67, unit: "kg/h", computed_in: null },
    { label: "Mass Recovery Efficiency", symbol: "f_retention", value: 0.99, unit: null, computed_in: null },
  ],
  ...over,
});

export const equations = (
  categories: MassEnergyBalancesEquationsDto["categories"] = [
    {
      id: "Cat1",
      chapter: 1,
      category: "Conservation (mass)",
      equipment: [
        {
          equipment_id: "E148",
          equipment: "Shredder",
          instance_id: "57",
          instance: "Shredder",
          equations: [
            card(),
            card({
              id: "EQ44",
              labelled_expression: "Dust and Fines Outlet = Combined Stream Flow (Maize Silage, Poultry Manure, Grass Silage) - Substrate Blend Stream Flow",
              expression: "m_dust_out = m_feedstock_in - m_shredded_out",
              output: { label: "Dust and Fines Outlet", symbol: "m_dust_out", value: 10.4167, unit: "kg/h", computed_in: null },
              inputs: [
                { label: "Combined Stream Flow (Maize Silage, Poultry Manure, Grass Silage)", symbol: "m_feedstock_in", value: 1041.67, unit: "kg/h", computed_in: null },
                { label: "Substrate Blend Stream Flow", symbol: "m_shredded_out", value: 1031.25, unit: "kg/h", computed_in: "EQ43" },
              ],
            }),
          ],
        },
      ],
    },
    {
      id: "Cat8",
      chapter: 2,
      category: "Time & Annualization",
      equipment: [
        {
          equipment_id: "E148",
          equipment: "Shredder",
          instance_id: "57",
          instance: "Shredder B",
          equations: [
            card({
              id: "EQ45",
              labelled_expression: "Annual Shredded Feedstock Production = Substrate Blend Stream Flow * Effective operating hours",
              expression: "m_shredded_annual = m_shredded_out * H_op_eff",
              description: null,
              output: { label: "Annual Shredded Feedstock Production", symbol: "m_shredded_annual", value: 9033750, unit: "kg/year", computed_in: null },
              inputs: [
                { label: "Substrate Blend Stream Flow", symbol: "m_shredded_out", value: 1031.25, unit: "kg/h", computed_in: "EQ43" },
                { label: "Effective operating hours", symbol: "H_op_eff", value: 8760, unit: "h/year", computed_in: "EQ42" },
              ],
            }),
          ],
        },
      ],
    },
  ],
  warnings: string[] = []
): MassEnergyBalancesEquationsDto => ({
  report_type: "mass_energy_balances_equations",
  report_document_id: 3,
  title: "Mass & Energy Balances: Equations",
  metadata: METADATA,
  categories,
  warnings,
});
