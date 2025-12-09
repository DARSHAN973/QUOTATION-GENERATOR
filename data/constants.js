// Default settings and constants for the CRM
export const DEFAULT_SETTINGS = {
  gst: 18,
  profitPercentage: 1.5,
  deadFreightRate: 1000,
  vehicleCapacities: [20, 25],
  defaultVehicleCapacity: 20,
};

// Material types
export const MATERIALS = {
  MS: 'MS',
  GI: 'GI',
  SEAMLESS: 'Seamless',
};

// Classes for MS and GI
export const CLASSES = {
  MEDIUM: 'Medium (B Class)',
  HEAVY: 'Heavy (C Class)',
};

// Schedule options for Seamless pipes
export const SCHEDULES = [
  'SCH-40',
  'SCH-80',
  'SCH-160',
  'STD',
  'XS',
  'XXS',
];

// Makes
export const MAKES = {
  JINDAL: 'JINDAL',
  MSL: 'MSL',
  KFIL: 'KFIL',
  HISSAR: 'HISSAR',
  STAR: 'STAR',
};

// Plant specific makes - simplified based on supply type only
export const PLANT_MAKES = {
  'From Godown': ['HISSAR', 'STAR'],
  'Direct From Jindal': ['JINDAL', 'MSL', 'KFIL'],
};

// Predefined heading templates with their sub-item configurations
export const HEADING_TEMPLATES = {
  'MS_B_IS1239': {
    id: 'MS_B_IS1239',
    text: 'MS ERW PIPE B CLASS AS PER IS1239 MAKE JINDAL',
    material: 'MS',
    make: 'JINDAL',
    pipeClass: 'Medium (B Class)',
    standard: 'IS1239',
    availableSizes: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150], // 15NB to 150NB
  },
  'MS_B_IS3589': {
    id: 'MS_B_IS3589',
    text: 'MS ERW PIPE B CLASS AS PER IS3589 MAKE JINDAL',
    material: 'MS',
    make: 'JINDAL',
    pipeClass: 'Medium (B Class)',
    standard: 'IS3589',
    availableSizes: [200, 250, 300, 350, 400, 450, 500, 600], // 200NB to 600NB
  },
  'MS_C_IS1239': {
    id: 'MS_C_IS1239',
    text: 'MS ERW PIPE C CLASS AS PER IS1239 MAKE JINDAL',
    material: 'MS',
    make: 'JINDAL',
    pipeClass: 'Heavy (C Class)',
    standard: 'IS1239',
    availableSizes: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150], // 15NB to 150NB
  },
  'MS_C_IS3589': {
    id: 'MS_C_IS3589',
    text: 'MS ERW PIPE C CLASS AS PER IS3589 MAKE JINDAL',
    material: 'MS',
    make: 'JINDAL',
    pipeClass: 'Heavy (C Class)',
    standard: 'IS3589',
    availableSizes: [200, 250, 300, 350, 400, 450, 500, 600], // 200NB to 600NB
  },
  'GI_B_IS1239': {
    id: 'GI_B_IS1239',
    text: 'GI PIPE B CLASS IS1239 SWS MAKE JINDAL',
    material: 'GI',
    make: 'JINDAL',
    pipeClass: 'Medium (B Class)',
    standard: 'IS1239',
    availableSizes: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150], // 15NB to 150NB
  },
  'GI_C_PE': {
    id: 'GI_C_PE',
    text: 'GI PIPE C CLASS P/E MAKE JINDAL',
    material: 'GI',
    make: 'JINDAL',
    pipeClass: 'Heavy (C Class)',
    standard: 'PE',
    availableSizes: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150], // 15NB to 150NB
  },
  'SEAMLESS_SA106': {
    id: 'SEAMLESS_SA106',
    text: 'CS SEAMLESS PIPE AS PER SA106 GRADE B MAKE MSL/KFIL',
    material: 'Seamless',
    make: 'MSL/KFIL',
    pipeClass: '', // Not applicable for seamless
    standard: 'SA106',
    availableSizes: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600], // All sizes
  },
};

// Pipe sizes (NB)
export const PIPE_SIZES = [
  15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600
];

// Godowns
export const GODOWNS = {
  WAGHOLI: 'Wagholi',
};

// Supply types
export const SUPPLY_TYPES = {
  GODOWN: 'From Godown',
  DIRECT: 'Direct From Jindal',
  MANUAL: 'Custom/Manual Rates',
};

// Quantity input modes
export const QUANTITY_UNITS = {
  PIPES: 'Number of Pipes',
  METERS: 'Total Meters',  
  KGS: 'Total Weight (Kgs)',
};

// For backward compatibility
export const LENGTH_MODES = QUANTITY_UNITS;

// Rate basis
export const RATE_BASIS = {
  PER_MTR: 'Per Mtr',
  PER_KG: 'Per Kg',
};

// Default pipe length
export const DEFAULT_PIPE_LENGTH = 6;

// Payment terms
export const PAYMENT_TERMS = [
  'Against Delivery',
  'Within 15 Days',
  'Within 30 Days',
  '50% Advance - 50% Against Delivery',
  '100% Advance',
];