import { db } from './src/lib/db.js';
import bcrypt from 'bcryptjs';

async function checkAndCreateAdmin() {
  try {
    console.log('Checking database connection...');
    
    // Check if admin exists
    const existingAdmin = await db.admin.findUnique({
      where: { email: "admin@oishine.com" }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      console.log('Active:', existingAdmin.isActive);
      console.log('Last Login:', existingAdmin.lastLogin);
    } else {
      console.log('❌ No admin found. Creating admin...');
      
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = await db.admin.create({
        data: {
          email: "admin@oishine.com",
          name: "Admin OISHINE",
          password: hashedPassword,
          role: "SUPER_ADMIN",
          isActive: true
        }
      });

      console.log('✅ Admin created successfully!');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
      console.log('Password: admin123');
    }

    // Test login with password
    console.log('\n🧪 Testing password verification...');
    const testAdmin = await db.admin.findUnique({
      where: { email: "admin@oishine.com" }
    });

    if (testAdmin) {
      const isValid = await bcrypt.compare("admin123", testAdmin.password);
      console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkAndCreateAdmin();