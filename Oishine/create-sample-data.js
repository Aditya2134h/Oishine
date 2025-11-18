import { db } from './src/lib/db.js';

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Create categories
    const categories = await Promise.all([
      db.category.upsert({
        where: { name: 'Mie' },
        update: {},
        create: {
          name: 'Mie',
          description: 'Berbagai macam mie nikmat'
        }
      }),
      db.category.upsert({
        where: { name: 'Minuman' },
        update: {},
        create: {
          name: 'Minuman',
          description: 'Minuman segar dan dingin'
        }
      }),
      db.category.upsert({
        where: { name: 'Snack' },
        update: {},
        create: {
          name: 'Snack',
          description: 'Cemilan enak dan bergizi'
        }
      })
    ]);

    console.log('✅ Categories created:', categories.map(c => c.name));

    // Create products (using create instead of upsert since name is not unique)
    const products = await Promise.all([
      db.product.create({
        data: {
          name: 'Mie Ayam Spesial',
          description: 'Mie ayam dengan resep rahasia OISHINE',
          price: 25000,
          categoryId: categories[0].id,
          image: '/products/mie-ayam.jpg',
          isAvailable: true
        }
      }),
      db.product.create({
        data: {
          name: 'Mie Goreng OISHINE',
          description: 'Mie goreng dengan bumbu pilihan',
          price: 22000,
          categoryId: categories[0].id,
          image: '/products/mie-goreng.jpg',
          isAvailable: true
        }
      }),
      db.product.create({
        data: {
          name: 'Es Teh Manis',
          description: 'Teh manis dingin yang menyegarkan',
          price: 8000,
          categoryId: categories[1].id,
          image: '/products/es-teh.jpg',
          isAvailable: true
        }
      }),
      db.product.create({
        data: {
          name: 'Kentang Goreng',
          description: 'Kentang goreng renyah dengan saus pilihan',
          price: 15000,
          categoryId: categories[2].id,
          image: '/products/kentang.jpg',
          isAvailable: true
        }
      })
    ]);

    console.log('✅ Products created:', products.map(p => p.name));

    // Create sample orders
    const orders = await Promise.all([
      db.order.create({
        data: {
          name: 'Budi Santoso',
          email: 'budi@email.com',
          phone: '08123456789',
          address: 'Jl. Merdeka No. 123, Jakarta',
          total: 33000,
          status: 'PENDING',
          items: {
            create: [
              {
                productId: products[0].id,
                quantity: 1,
                price: 25000
              },
              {
                productId: products[2].id,
                quantity: 1,
                price: 8000
              }
            ]
          }
        }
      }),
      db.order.create({
        data: {
          name: 'Siti Nurhaliza',
          email: 'siti@email.com',
          phone: '08234567890',
          address: 'Jl. Sudirman No. 456, Jakarta',
          total: 22000,
          status: 'CONFIRMED',
          items: {
            create: [
              {
                productId: products[1].id,
                quantity: 1,
                price: 22000
              }
            ]
          }
        }
      }),
      db.order.create({
        data: {
          name: 'Ahmad Fadli',
          email: 'ahmad@email.com',
          phone: '08345678901',
          address: 'Jl. Thamrin No. 789, Jakarta',
          total: 15000,
          status: 'DELIVERING',
          items: {
            create: [
              {
                productId: products[3].id,
                quantity: 1,
                price: 15000
              }
            ]
          }
        }
      })
    ]);

    console.log('✅ Sample orders created:', orders.length);

    console.log('\n🎉 Sample data created successfully!');
    console.log('You can now test the CRUD functionality with this data.');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await db.$disconnect();
  }
}

createSampleData();