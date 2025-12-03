// Simple database connection test
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Create tables
    console.log('Creating tables...');
    
    // Since we can't use migrations, let's create tables manually
    const createTables = `
      CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR(255) PRIMARY KEY,
        sr_no VARCHAR(255) UNIQUE NOT NULL,
        party_name TEXT NOT NULL,
        quotation_date DATE NOT NULL,
        status ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CONVERTED') DEFAULT 'DRAFT',
        supply_type TEXT NOT NULL,
        godown TEXT,
        plant TEXT NOT NULL,
        gst FLOAT DEFAULT 18,
        vehicle_capacity FLOAT,
        dead_freight_rate FLOAT,
        base_rate FLOAT,
        profit_percentage FLOAT,
        apply_to_all BOOLEAN DEFAULT FALSE,
        payment_term TEXT,
        valid_till_date DATE,
        show_transport_extra BOOLEAN DEFAULT TRUE,
        show_loading_extra BOOLEAN DEFAULT TRUE,
        show_godown_location BOOLEAN DEFAULT TRUE,
        custom_payment_term TEXT,
        total_qty FLOAT DEFAULT 0,
        total_weight FLOAT DEFAULT 0,
        net_amount FLOAT DEFAULT 0,
        gst_amount FLOAT DEFAULT 0,
        total_amount FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by TEXT,
        notes TEXT
      );
    `;
    
    await prisma.$executeRawUnsafe(createTables);
    console.log('✅ Tables created successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();