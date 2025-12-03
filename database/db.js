// Database utility functions for SQLite
// This handles database connections and operations

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CREATE_TABLES, SAMPLE_DATA } from './schema.js';

// Database connection
let db = null;

// Initialize database connection
export const initDatabase = () => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Connect to database
    const dbPath = path.join(dataDir, 'quotations.db');
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Create tables
    createTables();
    
    // Check if we need to seed data
    const quotationCount = db.prepare('SELECT COUNT(*) as count FROM quotations').get();
    if (quotationCount.count === 0) {
      seedDatabase();
    }
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Create all tables
const createTables = () => {
  try {
    Object.values(CREATE_TABLES).forEach(sql => {
      db.exec(sql);
    });
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
    throw error;
  }
};

// Seed database with initial data
const seedDatabase = () => {
  try {
    // Insert pipe weights
    const insertPipeWeight = db.prepare(`
      INSERT INTO pipe_weights (material, size, pipe_class, schedule, thickness, weight_per_mtr, standard, specification)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    SAMPLE_DATA.pipe_weights.forEach(weight => {
      insertPipeWeight.run(
        weight.material,
        weight.size,
        weight.pipe_class,
        weight.schedule,
        weight.thickness,
        weight.weight_per_mtr,
        weight.standard,
        weight.specification
      );
    });
    
    // Insert dynamic rates
    const insertRate = db.prepare(`
      INSERT INTO dynamic_rates (plant, material, pipe_class, schedule, rate_per_kg, effective_date, is_active, created_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    SAMPLE_DATA.dynamic_rates.forEach(rate => {
      insertRate.run(
        rate.plant,
        rate.material,
        rate.pipe_class,
        rate.schedule,
        rate.rate_per_kg,
        rate.effective_date,
        rate.is_active,
        rate.created_by,
        rate.notes
      );
    });
    
    console.log('Database seeded with initial data');
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};

// Get database connection
export const getDatabase = () => {
  if (!db) {
    initDatabase();
  }
  return db;
};

// Close database connection
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};

// Execute a query with parameters
export const query = (sql, params = []) => {
  try {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(params);
    } else {
      return stmt.run(params);
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute multiple queries in a transaction
export const transaction = (queries) => {
  try {
    const database = getDatabase();
    const tx = database.transaction(() => {
      queries.forEach(({ sql, params = [] }) => {
        const stmt = database.prepare(sql);
        stmt.run(params);
      });
    });
    
    return tx();
  } catch (error) {
    console.error('Database transaction error:', error);
    throw error;
  }
};

// Quotation-specific database operations
export const quotationDB = {
  // Save a new quotation
  saveQuotation: (quotationData) => {
    try {
      const database = getDatabase();
      
      const tx = database.transaction(() => {
        // Insert quotation
        const insertQuotation = database.prepare(`
          INSERT INTO quotations (
            id, sr_no, party_name, quotation_date, status,
            supply_type, godown, plant, gst,
            vehicle_capacity, dead_freight_rate, base_rate, profit_percentage, apply_to_all,
            payment_term, valid_till_date, show_transport_extra, show_loading_extra, show_godown_location, custom_payment_term,
            total_qty, total_weight, net_amount, gst_amount, total_amount,
            created_by, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        insertQuotation.run(
          quotationData.id,
          quotationData.srNo,
          quotationData.partyName,
          quotationData.quotationDate,
          quotationData.status,
          quotationData.orderSettings.supplyType,
          quotationData.orderSettings.godown,
          quotationData.orderSettings.plant,
          quotationData.orderSettings.gst,
          quotationData.bulkCalculation?.vehicleCapacity,
          quotationData.bulkCalculation?.deadFreightRate,
          quotationData.bulkCalculation?.baseRate,
          quotationData.bulkCalculation?.profitPercentage,
          quotationData.bulkCalculation?.applyToAll ? 1 : 0,
          quotationData.termsAndConditions?.paymentTerm,
          quotationData.termsAndConditions?.validTillDate,
          quotationData.termsAndConditions?.showTransportExtra ? 1 : 0,
          quotationData.termsAndConditions?.showLoadingExtra ? 1 : 0,
          quotationData.termsAndConditions?.showGodownLocation ? 1 : 0,
          quotationData.termsAndConditions?.customPaymentTerm,
          quotationData.totals.totalQty,
          quotationData.totals.totalWeight,
          quotationData.totals.netAmount,
          quotationData.totals.gstAmount,
          quotationData.totals.totalAmount,
          'system', // created_by
          quotationData.notes
        );
        
        // Insert line items
        const insertLineItem = database.prepare(`
          INSERT INTO line_items (
            id, quotation_id, order_index,
            material, sizes, pipe_class, schedule, make, thickness,
            total_kg, total_meters, wt_per_mtr,
            base_rate, dead_freight, profit_amount, final_rate, rate_basis,
            line_amount, custom_description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        quotationData.lineItems.forEach((item, index) => {
          insertLineItem.run(
            item.id,
            quotationData.id,
            index,
            item.material,
            JSON.stringify(item.sizes),
            item.pipeClass,
            item.schedule,
            item.make,
            item.thickness,
            item.totalKg,
            item.totalMeters,
            item.wtPerMtr,
            item.baseRate,
            item.deadFreight,
            item.profitAmount,
            item.finalRate,
            item.rateBasis,
            item.lineAmount,
            item.customDescription
          );
        });
      });
      
      tx();
      return { success: true };
    } catch (error) {
      console.error('Error saving quotation:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get all quotations
  getQuotations: () => {
    try {
      const database = getDatabase();
      const quotations = database.prepare(`
        SELECT * FROM quotations 
        ORDER BY created_at DESC
      `).all();
      
      return quotations.map(q => ({
        ...q,
        quotationDate: new Date(q.quotation_date),
        createdAt: new Date(q.created_at),
        updatedAt: new Date(q.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  },
  
  // Get quotation by ID with line items
  getQuotationById: (id) => {
    try {
      const database = getDatabase();
      
      // Get quotation
      const quotation = database.prepare('SELECT * FROM quotations WHERE id = ?').get(id);
      if (!quotation) return null;
      
      // Get line items
      const lineItems = database.prepare(`
        SELECT * FROM line_items 
        WHERE quotation_id = ? 
        ORDER BY order_index
      `).all(id);
      
      return {
        ...quotation,
        lineItems: lineItems.map(item => ({
          ...item,
          sizes: JSON.parse(item.sizes)
        })),
        quotationDate: new Date(quotation.quotation_date),
        createdAt: new Date(quotation.created_at),
        updatedAt: new Date(quotation.updated_at)
      };
    } catch (error) {
      console.error('Error fetching quotation:', error);
      return null;
    }
  },
  
  // Update quotation status
  updateQuotationStatus: (id, status) => {
    try {
      const database = getDatabase();
      const result = database.prepare(`
        UPDATE quotations 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(status, id);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating quotation status:', error);
      return false;
    }
  },
  
  // Delete quotation
  deleteQuotation: (id) => {
    try {
      const database = getDatabase();
      const result = database.prepare('DELETE FROM quotations WHERE id = ?').run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      return false;
    }
  }
};

// Pipe weights operations
export const pipeWeightsDB = {
  // Get all pipe weights
  getAll: () => {
    try {
      const database = getDatabase();
      return database.prepare('SELECT * FROM pipe_weights ORDER BY material, size').all();
    } catch (error) {
      console.error('Error fetching pipe weights:', error);
      return [];
    }
  },
  
  // Get weight for specific pipe
  getWeight: (material, size, pipeClass, schedule, thickness) => {
    try {
      const database = getDatabase();
      const result = database.prepare(`
        SELECT weight_per_mtr FROM pipe_weights 
        WHERE material = ? AND size = ? 
        AND (pipe_class = ? OR pipe_class IS NULL)
        AND (schedule = ? OR schedule IS NULL)
        AND (thickness = ? OR thickness IS NULL)
        ORDER BY 
          CASE WHEN pipe_class = ? THEN 1 ELSE 2 END,
          CASE WHEN schedule = ? THEN 1 ELSE 2 END,
          CASE WHEN thickness = ? THEN 1 ELSE 2 END
        LIMIT 1
      `).get(material, size, pipeClass, schedule, thickness, pipeClass, schedule, thickness);
      
      return result?.weight_per_mtr || 0;
    } catch (error) {
      console.error('Error fetching pipe weight:', error);
      return 0;
    }
  }
};

// Dynamic rates operations
export const dynamicRatesDB = {
  // Get active rate for specific criteria
  getRate: (plant, material, pipeClass, schedule) => {
    try {
      const database = getDatabase();
      const result = database.prepare(`
        SELECT rate_per_kg FROM dynamic_rates 
        WHERE plant = ? AND material = ? 
        AND (pipe_class = ? OR pipe_class IS NULL)
        AND (schedule = ? OR schedule IS NULL)
        AND is_active = 1
        ORDER BY 
          effective_date DESC,
          CASE WHEN pipe_class = ? THEN 1 ELSE 2 END,
          CASE WHEN schedule = ? THEN 1 ELSE 2 END
        LIMIT 1
      `).get(plant, material, pipeClass, schedule, pipeClass, schedule);
      
      return result?.rate_per_kg || 0;
    } catch (error) {
      console.error('Error fetching dynamic rate:', error);
      return 0;
    }
  },
  
  // Get all rates for a plant
  getRatesByPlant: (plant) => {
    try {
      const database = getDatabase();
      return database.prepare(`
        SELECT * FROM dynamic_rates 
        WHERE plant = ? AND is_active = 1
        ORDER BY material, pipe_class, schedule
      `).all(plant);
    } catch (error) {
      console.error('Error fetching rates by plant:', error);
      return [];
    }
  },
  
  // Update rate
  updateRate: (plant, material, pipeClass, schedule, ratePerKg, effectiveDate) => {
    try {
      const database = getDatabase();
      
      // Deactivate old rates
      database.prepare(`
        UPDATE dynamic_rates 
        SET is_active = 0 
        WHERE plant = ? AND material = ? 
        AND (pipe_class = ? OR pipe_class IS NULL)
        AND (schedule = ? OR schedule IS NULL)
      `).run(plant, material, pipeClass, schedule);
      
      // Insert new rate
      const result = database.prepare(`
        INSERT INTO dynamic_rates 
        (plant, material, pipe_class, schedule, rate_per_kg, effective_date, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 1, 'system')
      `).run(plant, material, pipeClass, schedule, ratePerKg, effectiveDate);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating rate:', error);
      return false;
    }
  }
};