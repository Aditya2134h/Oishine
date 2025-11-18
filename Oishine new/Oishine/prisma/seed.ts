import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const existingAdmin = await prisma.admin.findFirst();
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@oishine.com',
        name: 'Admin Oishine',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });
    console.log('Created admin user:', admin.email);
  } else {
    console.log('Admin user already exists:', existingAdmin.email);
  }

  // Create categories
  const categories = [
    { name: 'Mochi', description: 'Japanese rice cakes with various fillings' },
    { name: 'Dango', description: 'Sweet dumplings on skewers' },
    { name: 'Taiyaki', description: 'Fish-shaped pastries with sweet fillings' },
    { name: 'Matcha', description: 'Green tea flavored desserts and drinks' },
    { name: 'Wagashi', description: 'Traditional Japanese sweets' }
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name }
    });

    if (!existingCategory) {
      const createdCategory = await prisma.category.create({
        data: category
      });
      console.log('Created category:', createdCategory.name);
    } else {
      console.log('Category already exists:', existingCategory.name);
    }
  }

  // Create store settings
  const existingSettings = await prisma.storeSettings.findFirst();
  if (!existingSettings) {
    const settings = await prisma.storeSettings.create({
      data: {
        storeName: 'Oishine!',
        storeEmail: 'admin@oishine.com',
        storePhone: '+62 812-3456-7890',
        storeAddress: 'Purwokerto, Indonesia',
        storeDescription: 'Delicious Japanese Food Delivery - Purwokerto',
        currency: 'IDR',
        taxRate: 11,
        contactEmail: 'info@oishine.com',
        contactPhone: '+62 21 1234 5678',
        contactAddress: 'Jl. Jend. Gatot Subroto No. 30, Purwokerto',
        weekdayHours: '10:00 - 22:00',
        weekendHours: '10:00 - 23:00',
        holidayHours: '10:00 - 23:00'
      }
    });
    console.log('Created store settings');
  } else {
    console.log('Store settings already exist');
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });