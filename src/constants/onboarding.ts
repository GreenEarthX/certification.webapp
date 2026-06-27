// Option lists for the onboarding forms. Values MUST match the backend mirror at
// certification_backend/src/modules/onboarding/onboarding.constants.ts

export type Option = { value: string; label: string };

export const ROLE_IN_ORGANIZATION: Option[] = [
  { value: "executive_c_suite", label: "Executive / C-suite" },
  { value: "senior_management", label: "Senior management" },
  { value: "project_manager", label: "Project manager" },
  { value: "engineer_technical", label: "Engineer / technical" },
  { value: "compliance_legal", label: "Compliance / legal" },
  { value: "finance_treasury", label: "Finance / treasury" },
  { value: "commercial_sales", label: "Commercial / sales" },
  { value: "other", label: "Other" },
];

export const LEGAL_FORM: Option[] = [
  { value: "ltd_plc", label: "Limited (Ltd / Plc)" },
  { value: "gmbh_ag", label: "GmbH / AG" },
  { value: "sas_sa", label: "SAS / SA" },
  { value: "bv_nv", label: "BV / NV" },
  { value: "inc_corp_llc", label: "Inc / Corp / LLC" },
  { value: "partnership", label: "Partnership" },
  { value: "cooperative", label: "Cooperative" },
  { value: "other", label: "Other" },
];

export const INDUSTRY: Option[] = [
  { value: "hydrogen_production", label: "Hydrogen production" },
  { value: "efuels_synthetic_fuels", label: "E-fuels / synthetic fuels" },
  { value: "ammonia_saf", label: "Ammonia / SAF" },
  { value: "carbon_capture_ccus", label: "Carbon capture (CCUS)" },
  { value: "renewables_developer", label: "Renewables developer" },
  { value: "infrastructure_operator", label: "Infrastructure operator" },
  { value: "offtaker_industrial_buyer", label: "Offtaker / industrial buyer" },
  { value: "banking_finance", label: "Banking / finance" },
  { value: "epc_engineering", label: "EPC / engineering" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZE: Option[] = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-1000", label: "201–1,000" },
  { value: "1001-10000", label: "1,001–10,000" },
  { value: "10000+", label: "10,000+" },
];
