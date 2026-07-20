// @/models/overview.ts
export interface SchemeContent {
    overview: {
      types: {
        title: string;
        types: Array<{ type_title: string; details: string[] }>;
      };
      ensure: {
        title: string;
        list: string[];
      };
      description: string;
    };
    requirements: {
      criteria: {
        title: string;
        criteria_list: Array<{ criterion_title: string; details: string[] }>;
      };
      description: string;
      specific_low: {
        title: string;
        description: string;
        list: string[];
      };
      specific_green: {
        title: string;
        description: string;
        list: string[];
      };
    };
    process: {
      steps: Array<{ title: string; details: string[] }>;
    };
    compliance_score: number;
  }