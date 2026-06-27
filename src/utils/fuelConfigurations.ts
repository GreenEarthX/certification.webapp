export interface FuelQuestion {
  label: string;
  options: string[];
}

export interface FuelConfigurations {
  [key: string]: FuelQuestion[];
}

export const fuelConfigurations: FuelConfigurations = {
  hydrogen: [
    {
      label: 'Method of production',
      options: ['Electrolysis', 'Steam Methane Reforming', 'Biomass gasification', 'Coal gasification'],
    },
    {
      label: 'What is the feedstock used?',
      options: [
        'Renewable electricity',
        'Natural gas',
        'Water',
        'Coal or lignite',
        'Oil-based reforming processes',
        'Biogas',
        'Biomass gasification',
      ],
    },
  ],
  ammonia: [
    {
      label: 'What is the feedstock used?',
      options: ['Green hydrogen from electrolysis', 'Nitrogen from air separation', 'Blue hydrogen', 'Grey hydrogen', 'Biogas-derived hydrogen+ Nitrogen from air separation'],
    },
  ],
  eng: [
    {
      label: 'Method of production',
      options: ['Anaerobic digestion', 'Thermochemical gasification', 'Power-To-Gas (PTG) via Electrolysis'],
    },
    {
      label: 'What is the feedstock used?',
      options: [
        'Renewable hydrogen',
        'CO₂ from DAC',
        'Biogenic CO₂ from fermentation, biogas upgrading',
        'Biogas',
        'Syngas',
        'Natural gas',
      ],
    },
  ],
  saf: [
    {
      label: 'Method of production',
      options: [
        'Fischer Tropsh (FT) Synthesis',
        'HEFA',
        'Alcohol-to-Jet',
        'Power-to-Liquid (PtL)',
      ],
    },
    {
      label: 'What is the feedstock used?',
      options: [
        'Used cooking oil',
        'Animal fats',
        'Vegetable oils',
        'Forestry residues',
        'Agricultural residues',
        'Municipal solid waste',
        'Ethanol',
        'Butanol',
        'Renewable hydrogen',
        'CO₂ from DAC',
      ],
    },
  ],
  methanol: [
    {
      label: 'What is the feedstock used?',
      options: [
        'Renewable hydrogen + biogenic CO₂',
        'Biomass gasification',
        'Biogas upgrading',
        'Natural gas-based methanol',
        'Coal-based methanol',
        'Municipal solid waste',
        'Industrial waste CO₂ + H₂ utilization',
      ],
    },
  ],
  methanol_subtypes: [
    {
      label: 'Renewable subtype',
      options: [
        'Biomass gazification (Bio-methan)',
        'Electro-chemical CO2 Hydrogenation (E-methane)',
      ],
    },
  ],
  biofuels: [
    {
      label: 'Biofuel generation type',
      options: [
        'First generation Biofuel (conventional biofuels)',
        'Second generation Biofuel (advanced biofuels)',
        'Third generation Biofuels',
        'Fourth generation Biofuels'
      ]
    },
    {
      label: 'First generation Biofuel (conventional biofuels)',
      options: ['Ethanol fermentation (for bioethanol)', 'Transesterification (for biodiesel)']
    },
    {
      label: 'Second generation Biofuel (advanced biofuels)',
      options: ['Cellulosic ethanol production', 'Hydrotreated vegetable oils (HVO)', 'Renewable diesel', 'Fischer-Tro']
    },
    {
      label: 'Fourth generation Biofuels',
      options: ['Electrofuels (e-fuels)', 'Genetically engineered micro-organisms']
    },
    {
      label: 'What is the feedstock used?',
      options: [
        'Sugarcane', 'Corn', 'Wheat', 'Barley', 'Sugar beet', 'Rapeseed', 'Sunflower',
        'Palm oil', 'Soybean oil', 'Used cooking oil', 'Animal fats', 'Tall oil & tall oil pitch',
        'Palm fatty acid distillate', 'Agricultural residues', 'Forestry residues',
        'Municipal solid waste', 'Black liquor from pulp & paper mills', 'Microalgae',
        'Macroalgae', 'Cyanobacteria'
      ]
    }
  ],
};
