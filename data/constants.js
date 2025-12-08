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