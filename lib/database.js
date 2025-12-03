// Prisma database service
// This handles database operations using Prisma ORM

import { PrismaClient } from '@prisma/client';
import { generateQuotationId } from '../utils/quotationUtils.js';

// Global Prisma instance for development (prevents multiple instances)
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query']
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database service for quotations
export const quotationService = {
  // Create a new quotation
  async createQuotation(quotationData) {
    try {
      const result = await prisma.quotation.create({
        data: {
          id: quotationData.id || generateQuotationId(),
          srNo: quotationData.srNo,
          partyName: quotationData.partyName,
          quotationDate: new Date(quotationData.quotationDate),
          status: quotationData.status || 'DRAFT',
          
          // Order settings
          supplyType: quotationData.orderSettings.supplyType,
          godown: quotationData.orderSettings.godown,
          plant: quotationData.orderSettings.plant,
          gst: quotationData.orderSettings.gst,
          
          // Bulk calculation
          vehicleCapacity: quotationData.bulkCalculation?.vehicleCapacity,
          deadFreightRate: quotationData.bulkCalculation?.deadFreightRate,
          baseRate: quotationData.bulkCalculation?.baseRate,
          profitPercentage: quotationData.bulkCalculation?.profitPercentage,
          applyToAll: quotationData.bulkCalculation?.applyToAll || false,
          
          // Terms and conditions
          paymentTerm: quotationData.termsAndConditions?.paymentTerm,
          validTillDate: quotationData.termsAndConditions?.validTillDate ? 
            new Date(quotationData.termsAndConditions.validTillDate) : null,
          showTransportExtra: quotationData.termsAndConditions?.showTransportExtra !== false,
          showLoadingExtra: quotationData.termsAndConditions?.showLoadingExtra !== false,
          showGodownLocation: quotationData.termsAndConditions?.showGodownLocation !== false,
          customPaymentTerm: quotationData.termsAndConditions?.customPaymentTerm,
          
          // Totals
          totalQty: quotationData.totals?.totalQty || 0,
          totalWeight: quotationData.totals?.totalWeight || 0,
          netAmount: quotationData.totals?.netAmount || 0,
          gstAmount: quotationData.totals?.gstAmount || 0,
          totalAmount: quotationData.totals?.totalAmount || 0,
          
          // Metadata
          createdBy: 'system',
          notes: quotationData.notes,
          
          // Line items
          lineItems: {
            create: quotationData.lineItems?.map((item, index) => ({
              orderIndex: index,
              material: item.material,
              sizes: item.sizes,
              pipeClass: item.pipeClass,
              schedule: item.schedule,
              make: item.make,
              thickness: item.thickness,
              totalKg: item.totalKg || 0,
              totalMeters: item.totalMeters || 0,
              wtPerMtr: item.wtPerMtr || 0,
              baseRate: item.baseRate || 0,
              deadFreight: item.deadFreight || 0,
              profitAmount: item.profitAmount || 0,
              finalRate: item.finalRate || 0,
              rateBasis: item.rateBasis === 'Per Mtr' ? 'PER_MTR' : 'PER_KG',
              lineAmount: item.lineAmount || 0,
              customDescription: item.customDescription
            })) || []
          }
        },
        include: {
          lineItems: true
        }
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating quotation:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all quotations
  async getQuotations(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.partyName) {
        where.partyName = {
          contains: filters.partyName,
          mode: 'insensitive'
        };
      }
      
      if (filters.dateFrom || filters.dateTo) {
        where.quotationDate = {};
        if (filters.dateFrom) {
          where.quotationDate.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.quotationDate.lte = new Date(filters.dateTo);
        }
      }
      
      const quotations = await prisma.quotation.findMany({
        where,
        include: {
          lineItems: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return quotations.map(transformQuotationFromDB);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  },

  // Get quotation by ID
  async getQuotationById(id) {
    try {
      const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: {
          lineItems: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        }
      });
      
      if (!quotation) return null;
      
      return transformQuotationFromDB(quotation);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      return null;
    }
  },

  // Update quotation
  async updateQuotation(id, updateData) {
    try {
      const result = await prisma.quotation.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          lineItems: true
        }
      });
      
      return { success: true, data: transformQuotationFromDB(result) };
    } catch (error) {
      console.error('Error updating quotation:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete quotation
  async deleteQuotation(id) {
    try {
      await prisma.quotation.delete({
        where: { id }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting quotation:', error);
      return { success: false, error: error.message };
    }
  },

  // Get next SR number for current month
  async getNextSRNumber() {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthQuotations = await prisma.quotation.findMany({
        where: {
          quotationDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          srNo: true
        }
      });
      
      const monthAbbr = now.toLocaleString('default', { month: 'short' }).toUpperCase();
      
      let maxNumber = 0;
      monthQuotations.forEach(q => {
        if (q.srNo.startsWith(monthAbbr)) {
          const numberPart = q.srNo.slice(3);
          const num = parseInt(numberPart, 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `${monthAbbr}${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating SR number:', error);
      return `${new Date().toLocaleString('default', { month: 'short' }).toUpperCase()}001`;
    }
  }
};

// Pipe weights service
export const pipeWeightsService = {
  // Get all pipe weights
  async getAll() {
    try {
      return await prisma.pipeWeight.findMany({
        orderBy: [
          { material: 'asc' },
          { size: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Error fetching pipe weights:', error);
      return [];
    }
  },

  // Get weight for specific pipe
  async getWeight(material, size, pipeClass, schedule, thickness) {
    try {
      const weight = await prisma.pipeWeight.findFirst({
        where: {
          material,
          size,
          pipeClass: pipeClass || null,
          schedule: schedule || null,
          thickness: thickness || null
        },
        orderBy: [
          { pipeClass: pipeClass ? 'asc' : 'desc' },
          { schedule: schedule ? 'asc' : 'desc' },
          { thickness: thickness ? 'asc' : 'desc' }
        ]
      });
      
      return weight?.weightPerMtr || 0;
    } catch (error) {
      console.error('Error fetching pipe weight:', error);
      return 0;
    }
  },

  // Bulk insert pipe weights
  async bulkInsert(weights) {
    try {
      const result = await prisma.pipeWeight.createMany({
        data: weights
      });
      
      return { success: true, count: result.count };
    } catch (error) {
      console.error('Error inserting pipe weights:', error);
      return { success: false, error: error.message };
    }
  }
};

// Dynamic rates service
export const dynamicRatesService = {
  // Get active rate for specific criteria
  async getRate(plant, material, pipeClass, schedule) {
    try {
      const rate = await prisma.dynamicRate.findFirst({
        where: {
          plant,
          material,
          pipeClass: pipeClass || null,
          schedule: schedule || null,
          isActive: true
        },
        orderBy: [
          { effectiveDate: 'desc' },
          { pipeClass: pipeClass ? 'asc' : 'desc' },
          { schedule: schedule ? 'asc' : 'desc' }
        ]
      });
      
      return rate?.ratePerKg || 0;
    } catch (error) {
      console.error('Error fetching dynamic rate:', error);
      return 0;
    }
  },

  // Get all rates for a plant
  async getRatesByPlant(plant) {
    try {
      return await prisma.dynamicRate.findMany({
        where: {
          plant,
          isActive: true
        },
        orderBy: [
          { material: 'asc' },
          { pipeClass: 'asc' },
          { schedule: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Error fetching rates by plant:', error);
      return [];
    }
  },

  // Update rate (deactivates old, creates new)
  async updateRate(plant, material, pipeClass, schedule, ratePerKg, effectiveDate) {
    try {
      await prisma.$transaction(async (tx) => {
        // Deactivate old rates
        await tx.dynamicRate.updateMany({
          where: {
            plant,
            material,
            pipeClass: pipeClass || null,
            schedule: schedule || null
          },
          data: {
            isActive: false
          }
        });
        
        // Create new rate
        await tx.dynamicRate.create({
          data: {
            plant,
            material,
            pipeClass,
            schedule,
            ratePerKg,
            effectiveDate: new Date(effectiveDate),
            isActive: true
          }
        });
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating rate:', error);
      return { success: false, error: error.message };
    }
  }
};

// Transform quotation from database format to application format
function transformQuotationFromDB(dbQuotation) {
  return {
    id: dbQuotation.id,
    srNo: dbQuotation.srNo,
    partyName: dbQuotation.partyName,
    quotationDate: dbQuotation.quotationDate,
    status: dbQuotation.status.toLowerCase(),
    
    orderSettings: {
      supplyType: dbQuotation.supplyType,
      godown: dbQuotation.godown,
      plant: dbQuotation.plant,
      gst: dbQuotation.gst
    },
    
    bulkCalculation: {
      vehicleCapacity: dbQuotation.vehicleCapacity || 20,
      deadFreightRate: dbQuotation.deadFreightRate || 1000,
      baseRate: dbQuotation.baseRate || 200,
      profitPercentage: dbQuotation.profitPercentage || 1.5,
      applyToAll: dbQuotation.applyToAll || false
    },
    
    termsAndConditions: {
      paymentTerm: dbQuotation.paymentTerm,
      validTillDate: dbQuotation.validTillDate?.toISOString().split('T')[0],
      showTransportExtra: dbQuotation.showTransportExtra,
      showLoadingExtra: dbQuotation.showLoadingExtra,
      showGodownLocation: dbQuotation.showGodownLocation,
      customPaymentTerm: dbQuotation.customPaymentTerm
    },
    
    totals: {
      totalQty: dbQuotation.totalQty,
      totalWeight: dbQuotation.totalWeight,
      netAmount: dbQuotation.netAmount,
      gstAmount: dbQuotation.gstAmount,
      totalAmount: dbQuotation.totalAmount
    },
    
    lineItems: dbQuotation.lineItems?.map(item => ({
      id: item.id,
      material: item.material,
      sizes: Array.isArray(item.sizes) ? item.sizes : JSON.parse(item.sizes || '[]'),
      pipeClass: item.pipeClass,
      schedule: item.schedule,
      make: item.make,
      thickness: item.thickness,
      totalKg: item.totalKg,
      totalMeters: item.totalMeters,
      wtPerMtr: item.wtPerMtr,
      baseRate: item.baseRate,
      deadFreight: item.deadFreight,
      profitAmount: item.profitAmount,
      finalRate: item.finalRate,
      rateBasis: item.rateBasis === 'PER_MTR' ? 'Per Mtr' : 'Per Kg',
      lineAmount: item.lineAmount,
      customDescription: item.customDescription
    })) || [],
    
    createdAt: dbQuotation.createdAt,
    updatedAt: dbQuotation.updatedAt,
    notes: dbQuotation.notes
  };
}

// Initialize and seed database
export async function initializeDatabase() {
  try {
    // Check if database is already seeded
    const pipeWeightCount = await prisma.pipeWeight.count();
    
    if (pipeWeightCount === 0) {
      console.log('📦 Seeding pipe weights...');
      await seedPipeWeights();
      console.log('📈 Seeding dynamic rates...');
      await seedDynamicRates();
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Seed functions
async function seedPipeWeights() {
  const sampleWeights = [
    { material: 'ERW', size: '15NB', pipeClass: 'A', thickness: '2.65', weightPerMtr: 1.27, standard: 'IS', specification: 'IS 3589' },
    { material: 'ERW', size: '20NB', pipeClass: 'A', thickness: '2.65', weightPerMtr: 1.69, standard: 'IS', specification: 'IS 3589' },
    { material: 'ERW', size: '25NB', pipeClass: 'A', thickness: '3.25', weightPerMtr: 2.46, standard: 'IS', specification: 'IS 3589' },
    { material: 'ERW', size: '32NB', pipeClass: 'A', thickness: '3.25', weightPerMtr: 3.24, standard: 'IS', specification: 'IS 3589' },
    { material: 'ERW', size: '40NB', pipeClass: 'A', thickness: '3.25', weightPerMtr: 4.05, standard: 'IS', specification: 'IS 3589' },
    { material: 'ERW', size: '50NB', pipeClass: 'A', thickness: '3.65', weightPerMtr: 5.58, standard: 'IS', specification: 'IS 3589' }
  ];
  
  await pipeWeightsService.bulkInsert(sampleWeights);
}

async function seedDynamicRates() {
  const sampleRates = [
    { plant: 'Hissar', material: 'ERW', pipeClass: 'A', ratePerKg: 75.50, effectiveDate: '2024-12-01' },
    { plant: 'Hissar', material: 'ERW', pipeClass: 'B', ratePerKg: 73.50, effectiveDate: '2024-12-01' },
    { plant: 'Raipur', material: 'ERW', pipeClass: 'A', ratePerKg: 76.00, effectiveDate: '2024-12-01' },
    { plant: 'Raipur', material: 'ERW', pipeClass: 'B', ratePerKg: 74.00, effectiveDate: '2024-12-01' }
  ];
  
  for (const rate of sampleRates) {
    await dynamicRatesService.updateRate(
      rate.plant,
      rate.material,
      rate.pipeClass,
      null,
      rate.ratePerKg,
      rate.effectiveDate
    );
  }
}

export default prisma;