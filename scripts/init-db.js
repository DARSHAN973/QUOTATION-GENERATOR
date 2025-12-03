// Database initialization script
import { createAdminUser } from '../lib/auth.js';
import { initializeDatabase } from '../lib/database.js';

async function init() {
  try {
    console.log('🔧 Initializing database...');
    
    // Initialize database with seed data
    await initializeDatabase();
    
    // Create admin user
    console.log('👤 Creating admin user...');
    await createAdminUser();
    
    console.log('✅ Database initialization completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@quotationcrm.local');
    console.log('Password: admin123');
    console.log('\n🚀 You can now start the application with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

init();