// Real Price List data from HISSAR and STAR plants dated 11/11/2025
// Based on actual price lists provided

export const REAL_PRICE_LIST = {
  // HISSAR PLANT PRICES
  HISSAR: {
    // MS MEDIUM (B CLASS) 
    MS_MEDIUM: {
      15: { wtPerMtr: 1.13, discount: 26.00, rate: 118.52, costing: 87.99, wagholiRate: 89, puneRate: 90, plRate: 96 },
      20: { wtPerMtr: 1.45, discount: 26.00, rate: 151.87, costing: 112.75, wagholiRate: 114, puneRate: 115, plRate: 122 },
      25: { wtPerMtr: 2.24, discount: 26.00, rate: 211.43, costing: 157.02, wagholiRate: 159, puneRate: 160, plRate: 171 },
      32: { wtPerMtr: 2.86, discount: 26.00, rate: 272.83, costing: 202.61, wagholiRate: 205, puneRate: 207, plRate: 220 },
      40: { wtPerMtr: 3.30, discount: 26.00, rate: 310.88, costing: 230.88, wagholiRate: 233, puneRate: 236, plRate: 251 },
      50: { wtPerMtr: 4.70, discount: 26.00, rate: 426.05, costing: 316.45, wagholiRate: 320, puneRate: 323, plRate: 344 },
      65: { wtPerMtr: 6.00, discount: 26.00, rate: 536.76, costing: 398.70, wagholiRate: 403, puneRate: 407, plRate: 433 },
      80: { wtPerMtr: 7.80, discount: 26.00, rate: 665.28, costing: 494.26, wagholiRate: 499, puneRate: 504, plRate: 537 },
      100: { wtPerMtr: 11.20, discount: 26.00, rate: 969.50, costing: 720.23, wagholiRate: 727, puneRate: 735, plRate: 783 },
      125: { wtPerMtr: 15.00, discount: 26.00, rate: 1250.76, costing: 929.31, wagholiRate: 939, puneRate: 948, plRate: 1010 },
      150: { wtPerMtr: 17.50, discount: 26.00, rate: 1531.32, costing: 1137.55, wagholiRate: 1149, puneRate: 1160, plRate: 1236 },
      200: { wtPerMtr: 24.85, discount: 26.00, rate: 2180.00, costing: 1619.41, wagholiRate: 1652, puneRate: 1668, plRate: 1776 },
      250: { wtPerMtr: 31.09, discount: 24.00, rate: 2730.00, costing: 2082.57, wagholiRate: 2124, puneRate: 2145, plRate: 2284 },
      300: { wtPerMtr: 36.98, discount: 24.00, rate: 3247.00, costing: 2476.97, wagholiRate: 2527, puneRate: 2552, plRate: 2716 },
      600: { wtPerMtr: 132.03, discount: 24.00, rate: 8648.00, costing: 6591.00, wagholiRate: 9081, puneRate: 9772, plRate: 10529 }
    },

    // MS HEAVY (C CLASS)
    MS_HEAVY: {
      15: { wtPerMtr: 1.35, discount: 26.00, rate: 134.06, costing: 99.54, wagholiRate: 101, puneRate: 102, plRate: 108 },
      20: { wtPerMtr: 1.75, discount: 26.00, rate: 170.85, costing: 126.87, wagholiRate: 128, puneRate: 129, plRate: 138 },
      25: { wtPerMtr: 2.75, discount: 26.00, rate: 242.26, costing: 179.96, wagholiRate: 182, puneRate: 184, plRate: 196 },
      32: { wtPerMtr: 3.50, discount: 26.00, rate: 312.14, costing: 231.86, wagholiRate: 234, puneRate: 237, plRate: 252 },
      40: { wtPerMtr: 4.10, discount: 26.00, rate: 362.88, costing: 269.56, wagholiRate: 272, puneRate: 275, plRate: 293 },
      50: { wtPerMtr: 5.70, discount: 26.00, rate: 502.32, costing: 373.14, wagholiRate: 377, puneRate: 381, plRate: 405 },
      65: { wtPerMtr: 7.40, discount: 26.00, rate: 641.10, costing: 476.26, wagholiRate: 481, puneRate: 486, plRate: 517 },
      80: { wtPerMtr: 9.15, discount: 26.00, rate: 783.72, costing: 582.24, wagholiRate: 588, puneRate: 594, plRate: 633 },
      100: { wtPerMtr: 13.40, discount: 26.00, rate: 1128.12, costing: 838.16, wagholiRate: 847, puneRate: 855, plRate: 911 },
      125: { wtPerMtr: 16.50, discount: 26.00, rate: 1426.50, costing: 1059.74, wagholiRate: 1070, puneRate: 1081, plRate: 1151 },
      150: { wtPerMtr: 19.50, discount: 26.00, rate: 1679.16, costing: 1247.45, wagholiRate: 1260, puneRate: 1273, plRate: 1355 },
      200: { wtPerMtr: 29.50, discount: 26.00, rate: 2590.00, costing: 1923.98, wagholiRate: 1962, puneRate: 1982, plRate: 2110 },
      250: { wtPerMtr: 37.20, discount: 24.00, rate: 3265.00, costing: 2490.70, wagholiRate: 2541, puneRate: 2566, plRate: 2731 },
      300: { wtPerMtr: 44.15, discount: 24.00, rate: 3877.00, costing: 2957.56, wagholiRate: 3017, puneRate: 3047, plRate: 3243 },
      600: { wtPerMtr: 142.25, discount: 24.00, rate: 9317.00, costing: 7101.00, wagholiRate: 9783, puneRate: 10529, plRate: 11342 }
    },

    // GI MEDIUM (B CLASS) - using same rates as MS with appropriate markup
    GI_MEDIUM: {
      15: { wtPerMtr: 1.15, ratePerKg: 65.44, rate: 56650, costing: 57.47, wagholiRate: 66, puneRate: 67, plRate: 71 },
      20: { wtPerMtr: 1.45, ratePerKg: 81.78, rate: 56150, costing: 56.96, wagholiRate: 83, puneRate: 83, plRate: 89 },
      25: { wtPerMtr: 2.22, ratePerKg: 121.55, rate: 54500, costing: 55.30, wagholiRate: 123, puneRate: 124, plRate: 132 },
      32: { wtPerMtr: 2.86, ratePerKg: 156.59, rate: 54500, costing: 55.30, wagholiRate: 158, puneRate: 160, plRate: 170 },
      40: { wtPerMtr: 3.30, ratePerKg: 180.68, rate: 54500, costing: 55.30, wagholiRate: 182, puneRate: 184, plRate: 196 },
      50: { wtPerMtr: 4.67, ratePerKg: 255.68, rate: 54500, costing: 55.30, wagholiRate: 258, puneRate: 261, plRate: 278 },
      65: { wtPerMtr: 5.98, ratePerKg: 327.41, rate: 54500, costing: 55.30, wagholiRate: 331, puneRate: 334, plRate: 356 },
      80: { wtPerMtr: 7.70, ratePerKg: 421.58, rate: 54500, costing: 55.30, wagholiRate: 426, puneRate: 430, plRate: 458 },
      100: { wtPerMtr: 11.12, ratePerKg: 608.82, rate: 54500, costing: 55.30, wagholiRate: 615, puneRate: 621, plRate: 661 },
      125: { wtPerMtr: 14.80, ratePerKg: 810.30, rate: 54500, costing: 55.30, wagholiRate: 818, puneRate: 827, plRate: 880 },
      150: { wtPerMtr: 17.45, ratePerKg: 955.39, rate: 54500, costing: 55.30, wagholiRate: 965, puneRate: 975, plRate: 1038 },
      200: { wtPerMtr: 24.35, ratePerKg: 1333.16, rate: 54500, costing: 55.30, wagholiRate: 1346, puneRate: 1360, plRate: 1448 },
      250: { wtPerMtr: 30.48, ratePerKg: 1722.12, rate: 56250, costing: 57.35, wagholiRate: 1748, puneRate: 1765, plRate: 1880 },
      300: { wtPerMtr: 36.25, ratePerKg: 2048.13, rate: 56250, costing: 57.35, wagholiRate: 2079, puneRate: 2100, plRate: 2236 },
      600: { wtPerMtr: 74.66, ratePerKg: 4215.25, rate: 58000, costing: 58.50, wagholiRate: 4356, puneRate: 4401, plRate: 4685 }
    },

    // GI HEAVY (C CLASS)
    GI_HEAVY: {
      15: { wtPerMtr: 1.35, ratePerKg: 76.82, rate: 56650, costing: 57.47, wagholiRate: 78, puneRate: 78, plRate: 83 },
      20: { wtPerMtr: 1.75, ratePerKg: 98.70, rate: 56150, costing: 56.96, wagholiRate: 100, puneRate: 101, plRate: 107 },
      25: { wtPerMtr: 2.70, ratePerKg: 147.83, rate: 54500, costing: 55.30, wagholiRate: 149, puneRate: 151, plRate: 161 },
      32: { wtPerMtr: 3.50, ratePerKg: 191.63, rate: 54500, costing: 55.30, wagholiRate: 194, puneRate: 195, plRate: 208 },
      40: { wtPerMtr: 4.04, ratePerKg: 221.19, rate: 54500, costing: 55.30, wagholiRate: 223, puneRate: 226, plRate: 240 },
      50: { wtPerMtr: 5.68, ratePerKg: 310.98, rate: 54500, costing: 55.30, wagholiRate: 314, puneRate: 317, plRate: 338 },
      65: { wtPerMtr: 7.30, ratePerKg: 399.68, rate: 54500, costing: 55.30, wagholiRate: 404, puneRate: 408, plRate: 434 },
      80: { wtPerMtr: 9.15, ratePerKg: 500.96, rate: 54500, costing: 55.30, wagholiRate: 506, puneRate: 511, plRate: 544 },
      100: { wtPerMtr: 13.25, ratePerKg: 725.44, rate: 54500, costing: 55.30, wagholiRate: 733, puneRate: 740, plRate: 788 },
      125: { wtPerMtr: 16.45, ratePerKg: 900.64, rate: 54500, costing: 55.30, wagholiRate: 910, puneRate: 919, plRate: 979 },
      150: { wtPerMtr: 19.40, ratePerKg: 1062.15, rate: 54500, costing: 55.30, wagholiRate: 1073, puneRate: 1083, plRate: 1154 },
      200: { wtPerMtr: 29.00, ratePerKg: 1587.75, rate: 54500, costing: 55.30, wagholiRate: 1604, puneRate: 1620, plRate: 1725 },
      250: { wtPerMtr: 36.32, ratePerKg: 2052.08, rate: 56250, costing: 57.35, wagholiRate: 2083, puneRate: 2104, plRate: 2240 },
      300: { wtPerMtr: 43.22, ratePerKg: 2441.93, rate: 56250, costing: 57.35, wagholiRate: 2479, puneRate: 2503, plRate: 2665 },
      600: { wtPerMtr: 84.27, ratePerKg: 4761.25, rate: 58000, costing: 58.50, wagholiRate: 4930, puneRate: 4980, plRate: 5304 }
    }
  },

  // STAR PLANT PRICES (NAGOTHANE)
  STAR: {
    // Similar structure but with Star plant pricing
    MS_MEDIUM: {
      15: { wtPerMtr: 1.15, ratePerKg: 65.44, rate: 54750, costing: 57.47, wagholiRate: 66, puneRate: 67, plRate: 71 },
      20: { wtPerMtr: 1.45, ratePerKg: 81.78, rate: 54250, costing: 56.96, wagholiRate: 83, puneRate: 83, plRate: 89 },
      25: { wtPerMtr: 2.22, ratePerKg: 122.99, rate: 53250, costing: 55.95, wagholiRate: 124, puneRate: 125, plRate: 134 },
      32: { wtPerMtr: 2.86, ratePerKg: 158.44, rate: 53250, costing: 55.95, wagholiRate: 160, puneRate: 162, plRate: 172 },
      40: { wtPerMtr: 3.30, ratePerKg: 182.82, rate: 53250, costing: 55.95, wagholiRate: 185, puneRate: 186, plRate: 199 },
      50: { wtPerMtr: 4.67, ratePerKg: 258.72, rate: 53250, costing: 55.95, wagholiRate: 261, puneRate: 264, plRate: 281 },
      65: { wtPerMtr: 5.98, ratePerKg: 331.29, rate: 53250, costing: 55.95, wagholiRate: 335, puneRate: 338, plRate: 360 },
      80: { wtPerMtr: 7.70, ratePerKg: 426.58, rate: 53250, costing: 55.95, wagholiRate: 431, puneRate: 435, plRate: 463 },
      100: { wtPerMtr: 11.12, ratePerKg: 616.05, rate: 53250, costing: 55.95, wagholiRate: 622, puneRate: 628, plRate: 669 },
      125: { wtPerMtr: 14.80, ratePerKg: 819.92, rate: 53250, costing: 55.95, wagholiRate: 828, puneRate: 836, plRate: 891 },
      150: { wtPerMtr: 17.45, ratePerKg: 966.73, rate: 53250, costing: 55.95, wagholiRate: 976, puneRate: 986, plRate: 1050 },
      200: { wtPerMtr: 24.35, ratePerKg: 1348.99, rate: 53250, costing: 55.95, wagholiRate: 1362, puneRate: 1376, plRate: 1466 },
      250: { wtPerMtr: 30.48, ratePerKg: 1722.12, rate: 54250, costing: 57.35, wagholiRate: 1748, puneRate: 1765, plRate: 1880 },
      300: { wtPerMtr: 36.25, ratePerKg: 2048.13, rate: 54250, costing: 57.35, wagholiRate: 2079, puneRate: 2100, plRate: 2236 },
    600: { wtPerMtr: 74.66, ratePerKg: 4215.25, rate: 58000, costing: 58.50, wagholiRate: 4356, puneRate: 4401, plRate: 4685 }
    }
  },

  // SEAMLESS PIPES (MSL/KFIL Make)
  SEAMLESS: {
    15: { wtPerMtr: 2.77, schedule: 'SCH 40', ratePerKg: 130, costing: 131.5, godowRate: 132 },
    20: { wtPerMtr: 3.73, schedule: 'SCH 80', ratePerKg: 130, costing: 131.5, godowRate: 132 },
    25: { wtPerMtr: 2.87, schedule: 'SCH 40', ratePerKg: 120, costing: 121.5, godowRate: 122 },
    32: { wtPerMtr: 3.56, schedule: 'SCH 40', ratePerKg: 83, costing: 84.5, godowRate: 85 },
    40: { wtPerMtr: 3.68, schedule: 'SCH 40', ratePerKg: 82, costing: 83.5, godowRate: 84 },
    50: { wtPerMtr: 3.91, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    65: { wtPerMtr: 5.16, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    80: { wtPerMtr: 5.49, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    100: { wtPerMtr: 5.74, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    125: { wtPerMtr: 6.02, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    150: { wtPerMtr: 6.55, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    200: { wtPerMtr: 7.11, schedule: 'SCH 40', ratePerKg: 76, costing: 77.5, godowRate: 78 },
    250: { wtPerMtr: 6.35, schedule: 'SCH 20', ratePerKg: 80, costing: 81.5, godowRate: 82 },
    300: { wtPerMtr: 6.35, schedule: 'SCH 20', ratePerKg: 82, costing: 83.5, godowRate: 84 },
    600: { wtPerMtr: 74.66, schedule: 'SCH 20', ratePerKg: 58, costing: 59.5, godowRate: 61 }
  }
};

// For backward compatibility, create the old structure
export const SAMPLE_PRICE_LIST = {
  MS: REAL_PRICE_LIST.HISSAR.MS_MEDIUM,
  GI: REAL_PRICE_LIST.HISSAR.GI_MEDIUM,
  SEAMLESS: REAL_PRICE_LIST.SEAMLESS
};

// Function to get price list data by plant and material
export const getPriceListData = (plant = 'HISSAR', material, pipeClass = 'MEDIUM', size) => {
  const plantData = REAL_PRICE_LIST[plant.toUpperCase()];
  if (!plantData) return null;
  
  const materialKey = `${material.toUpperCase()}_${pipeClass.toUpperCase()}`;
  const materialData = plantData[materialKey] || plantData[material.toUpperCase()];
  
  return materialData?.[size] || null;
};

// Function to get all materials
export const getAllMaterials = () => {
  return ['MS', 'GI', 'SEAMLESS'];
};

// Function to get sizes for a material
export const getSizesForMaterial = (material) => {
  const sampleData = SAMPLE_PRICE_LIST[material];
  return sampleData ? Object.keys(sampleData).map(Number).sort((a, b) => a - b) : [];
};