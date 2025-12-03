// Description generation logic for different pipe types

import { MATERIALS, CLASSES, MAKES } from '../data/constants.js';

// Generate description for GI Pipe
export const generateGIDescription = (sizes, pipeClass, thickness = null) => {
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  
  // Determine IS standard based on size range
  const isStandard = (minSize >= 15 && maxSize <= 150) ? 'IS1239' : 'IS3589';
  
  // Use thickness if provided (for 200NB and above), otherwise use class
  let classText, swsPE;
  if (thickness && minSize >= 200) {
    classText = `THK ${thickness}`;
    swsPE = 'PE'; // Use PE for thick pipes
  } else {
    classText = pipeClass === CLASSES.MEDIUM ? 'B CLASS' : 'C CLASS';
    swsPE = pipeClass === CLASSES.MEDIUM ? 'SWS' : 'P/E';
  }
  
  const header = `GI PIPE ${classText} AS PER ${isStandard} ${swsPE} MAKE ${MAKES.JINDAL}`;
  
  const subLines = sizes.map((size) => `${size} NB`);
  
  return {
    header,
    subLines,
    fullDescription: `${header}\n${subLines.join('\n')}`
  };
};

// Generate description for MS Pipe
export const generateMSDescription = (sizes, pipeClass, thickness = null) => {
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  
  // Determine IS standard based on size range
  const isStandard = (minSize >= 15 && maxSize <= 150) ? 'IS1239' : 'IS3589';
  
  // Use thickness if provided (for 200NB and above), otherwise use class
  let classText;
  if (thickness && minSize >= 200) {
    classText = `THK ${thickness}`;
  } else {
    classText = pipeClass === CLASSES.MEDIUM ? 'B CLASS' : 'C CLASS';
  }
  
  const header = `MS ERW PIPE ${classText} AS PER ${isStandard} MAKE ${MAKES.JINDAL}`;
  
  const subLines = sizes.map((size) => `${size} NB`);
  
  return {
    header,
    subLines,
    fullDescription: `${header}\n${subLines.join('\n')}`
  };
};

// Generate description for Seamless Pipe
export const generateSeamlessDescription = (sizes, schedule, make = [MAKES.MSL, MAKES.KFIL]) => {
  const makeText = Array.isArray(make) ? make.join(' / ') : make;
  
  const header = `CS SEAMLESS PIPE SA 106 GR "B" ${schedule} MAKE ${makeText}`;
  
  const subLines = sizes.map((size) => `${size} NB`);
  
  return {
    header,
    subLines,
    fullDescription: `${header}\n${subLines.join('\n')}`
  };
};

// Main function to generate description based on material type
export const generateDescription = (material, sizes, options = {}) => {
  const sortedSizes = [...sizes].sort((a, b) => a - b);
  
  switch (material) {
    case MATERIALS.GI:
      return generateGIDescription(sortedSizes, options.pipeClass, options.thickness);
    
    case MATERIALS.MS:
      return generateMSDescription(sortedSizes, options.pipeClass, options.thickness);
    
    case MATERIALS.SEAMLESS:
      return generateSeamlessDescription(sortedSizes, options.schedule, options.make);
    
    default:
      return {
        header: 'UNKNOWN MATERIAL',
        subLines: [],
        fullDescription: 'UNKNOWN MATERIAL'
      };
  }
};

// Helper function to get thickness/SCH mapping for MS/GI
export const getThicknessForClass = (material, pipeClass, size) => {
  // This is a simplified mapping - you can expand this based on actual specifications
  if (material === MATERIALS.MS || material === MATERIALS.GI) {
    return pipeClass === CLASSES.MEDIUM ? 'B Class' : 'C Class';
  }
  return '';
};

// Helper function to validate description inputs
export const validateDescriptionInputs = (material, sizes, options) => {
  if (!material || !sizes || sizes.length === 0) {
    return { valid: false, error: 'Material and sizes are required' };
  }
  
  if (material === MATERIALS.SEAMLESS && !options.schedule) {
    return { valid: false, error: 'Schedule is required for seamless pipes' };
  }
  
  // For pipes 200NB and above (except seamless), require thickness instead of class
  const minSize = Math.min(...sizes);
  if ((material === MATERIALS.MS || material === MATERIALS.GI)) {
    if (minSize >= 200 && !options.thickness) {
      return { valid: false, error: 'Thickness is required for pipes 200NB and above' };
    }
    if (minSize < 200 && !options.pipeClass) {
      return { valid: false, error: 'Pipe class is required for pipes below 200NB' };
    }
  }
  
  return { valid: true };
};