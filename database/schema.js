// Database configuration for quotation CRM
// This file contains the database schema for storing quotations and related data

export const DB_CONFIG = {
  // For development - using SQLite
  development: {
    type: 'sqlite',
    database: './data/quotations.db'
  },
  
  // For production - can be configured for PostgreSQL, MySQL, etc.
  production: {
    type: 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'quotation_crm',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  }
};

// Database schema definitions
export const SCHEMA = {
  // Main quotations table
  quotations: {
    id: 'TEXT PRIMARY KEY',
    sr_no: 'TEXT UNIQUE NOT NULL',
    party_name: 'TEXT NOT NULL',
    quotation_date: 'DATE NOT NULL',
    status: "TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'converted'))",
    
    // Order settings
    supply_type: 'TEXT NOT NULL',
    godown: 'TEXT',
    plant: 'TEXT NOT NULL',
    gst: 'REAL NOT NULL DEFAULT 18',
    
    // Bulk calculation settings (for direct supply)
    vehicle_capacity: 'REAL',
    dead_freight_rate: 'REAL',
    base_rate: 'REAL',
    profit_percentage: 'REAL',
    apply_to_all: 'BOOLEAN DEFAULT 0',
    
    // Terms and conditions
    payment_term: 'TEXT',
    valid_till_date: 'DATE',
    show_transport_extra: 'BOOLEAN DEFAULT 1',
    show_loading_extra: 'BOOLEAN DEFAULT 1',
    show_godown_location: 'BOOLEAN DEFAULT 1',
    custom_payment_term: 'TEXT',
    
    // Totals
    total_qty: 'REAL DEFAULT 0',
    total_weight: 'REAL DEFAULT 0',
    net_amount: 'REAL DEFAULT 0',
    gst_amount: 'REAL DEFAULT 0',
    total_amount: 'REAL DEFAULT 0',
    
    // Metadata
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    created_by: 'TEXT',
    notes: 'TEXT'
  },
  
  // Line items for each quotation
  line_items: {
    id: 'TEXT PRIMARY KEY',
    quotation_id: 'TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE',
    order_index: 'INTEGER NOT NULL',
    
    // Item details
    material: 'TEXT NOT NULL',
    sizes: 'TEXT NOT NULL', // JSON array
    pipe_class: 'TEXT',
    schedule: 'TEXT',
    make: 'TEXT',
    thickness: 'TEXT',
    
    // Quantities and weights
    total_kg: 'REAL NOT NULL DEFAULT 0',
    total_meters: 'REAL NOT NULL DEFAULT 0',
    wt_per_mtr: 'REAL NOT NULL DEFAULT 0',
    
    // Rates
    base_rate: 'REAL NOT NULL DEFAULT 0',
    dead_freight: 'REAL NOT NULL DEFAULT 0',
    profit_amount: 'REAL NOT NULL DEFAULT 0',
    final_rate: 'REAL NOT NULL DEFAULT 0',
    rate_basis: "TEXT NOT NULL DEFAULT 'Per Kg' CHECK (rate_basis IN ('Per Kg', 'Per Mtr'))",
    
    // Calculated amounts
    line_amount: 'REAL NOT NULL DEFAULT 0',
    
    // Custom description (if edited)
    custom_description: 'TEXT',
    
    // Metadata
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  },
  
  // Dynamic rates based on plant and material
  dynamic_rates: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    plant: 'TEXT NOT NULL',
    material: 'TEXT NOT NULL',
    pipe_class: 'TEXT',
    schedule: 'TEXT',
    rate_per_kg: 'REAL NOT NULL',
    rate_per_mtr: 'REAL',
    effective_date: 'DATE NOT NULL',
    is_active: 'BOOLEAN DEFAULT 1',
    
    // Metadata
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    created_by: 'TEXT',
    notes: 'TEXT',
    
    // Unique constraint
    UNIQUE: '(plant, material, pipe_class, schedule, effective_date)'
  },
  
  // Static pipe weights (offline data)
  pipe_weights: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    material: 'TEXT NOT NULL',
    size: 'TEXT NOT NULL',
    pipe_class: 'TEXT',
    schedule: 'TEXT',
    thickness: 'TEXT',
    weight_per_mtr: 'REAL NOT NULL',
    
    // Reference data
    standard: 'TEXT', // IS, ASTM, etc.
    specification: 'TEXT',
    
    // Metadata
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    
    // Unique constraint
    UNIQUE: '(material, size, pipe_class, schedule, thickness)'
  },
  
  // Audit log for tracking changes
  audit_log: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    table_name: 'TEXT NOT NULL',
    record_id: 'TEXT NOT NULL',
    action: "TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))",
    old_values: 'TEXT', // JSON
    new_values: 'TEXT', // JSON
    user_id: 'TEXT',
    timestamp: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    ip_address: 'TEXT',
    user_agent: 'TEXT'
  }
};

// Create table SQL statements
export const CREATE_TABLES = {
  quotations: `
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      sr_no TEXT UNIQUE NOT NULL,
      party_name TEXT NOT NULL,
      quotation_date DATE NOT NULL,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'converted')),
      
      supply_type TEXT NOT NULL,
      godown TEXT,
      plant TEXT NOT NULL,
      gst REAL NOT NULL DEFAULT 18,
      
      vehicle_capacity REAL,
      dead_freight_rate REAL,
      base_rate REAL,
      profit_percentage REAL,
      apply_to_all BOOLEAN DEFAULT 0,
      
      payment_term TEXT,
      valid_till_date DATE,
      show_transport_extra BOOLEAN DEFAULT 1,
      show_loading_extra BOOLEAN DEFAULT 1,
      show_godown_location BOOLEAN DEFAULT 1,
      custom_payment_term TEXT,
      
      total_qty REAL DEFAULT 0,
      total_weight REAL DEFAULT 0,
      net_amount REAL DEFAULT 0,
      gst_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      notes TEXT
    )
  `,
  
  line_items: `
    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      
      material TEXT NOT NULL,
      sizes TEXT NOT NULL,
      pipe_class TEXT,
      schedule TEXT,
      make TEXT,
      thickness TEXT,
      
      total_kg REAL NOT NULL DEFAULT 0,
      total_meters REAL NOT NULL DEFAULT 0,
      wt_per_mtr REAL NOT NULL DEFAULT 0,
      
      base_rate REAL NOT NULL DEFAULT 0,
      dead_freight REAL NOT NULL DEFAULT 0,
      profit_amount REAL NOT NULL DEFAULT 0,
      final_rate REAL NOT NULL DEFAULT 0,
      rate_basis TEXT NOT NULL DEFAULT 'Per Kg' CHECK (rate_basis IN ('Per Kg', 'Per Mtr')),
      
      line_amount REAL NOT NULL DEFAULT 0,
      custom_description TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )
  `,
  
  dynamic_rates: `
    CREATE TABLE IF NOT EXISTS dynamic_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant TEXT NOT NULL,
      material TEXT NOT NULL,
      pipe_class TEXT,
      schedule TEXT,
      rate_per_kg REAL NOT NULL,
      rate_per_mtr REAL,
      effective_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      notes TEXT,
      
      UNIQUE(plant, material, pipe_class, schedule, effective_date)
    )
  `,
  
  pipe_weights: `
    CREATE TABLE IF NOT EXISTS pipe_weights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material TEXT NOT NULL,
      size TEXT NOT NULL,
      pipe_class TEXT,
      schedule TEXT,
      thickness TEXT,
      weight_per_mtr REAL NOT NULL,
      
      standard TEXT,
      specification TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(material, size, pipe_class, schedule, thickness)
    )
  `,
  
  audit_log: `
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
      old_values TEXT,
      new_values TEXT,
      user_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )
  `
};

// Sample data for initial setup
export const SAMPLE_DATA = {
  // Sample pipe weights data
  pipe_weights: [
    {
      material: 'ERW',
      size: '15NB',
      pipe_class: 'A',
      schedule: null,
      thickness: '2.65',
      weight_per_mtr: 1.27,
      standard: 'IS',
      specification: 'IS 3589'
    },
    {
      material: 'ERW',
      size: '20NB',
      pipe_class: 'A',
      schedule: null,
      thickness: '2.65',
      weight_per_mtr: 1.69,
      standard: 'IS',
      specification: 'IS 3589'
    },
    {
      material: 'ERW',
      size: '25NB',
      pipe_class: 'A',
      schedule: null,
      thickness: '3.25',
      weight_per_mtr: 2.46,
      standard: 'IS',
      specification: 'IS 3589'
    }
  ],
  
  // Sample dynamic rates
  dynamic_rates: [
    {
      plant: 'Hissar',
      material: 'ERW',
      pipe_class: 'A',
      schedule: null,
      rate_per_kg: 75.50,
      effective_date: '2024-12-01',
      is_active: 1,
      created_by: 'system',
      notes: 'Initial rates for December 2024'
    },
    {
      plant: 'Hissar',
      material: 'ERW',
      pipe_class: 'B',
      schedule: null,
      rate_per_kg: 73.50,
      effective_date: '2024-12-01',
      is_active: 1,
      created_by: 'system',
      notes: 'Initial rates for December 2024'
    }
  ]
};