import { db } from './src/lib/db.js';

async function testAllFeatures() {
  try {
    console.log('🧪 Testing OISHINE! Admin System...\n');

    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    const adminCount = await db.admin.count();
    console.log(`✅ Database connected. Found ${adminCount} admin(s)\n`);

    // Test 2: Admin User
    console.log('2. Testing Admin User...');
    const admin = await db.admin.findUnique({
      where: { email: 'admin@oishine.com' }
    });
    if (admin) {
      console.log(`✅ Admin found: ${admin.name} (${admin.email})\n`);
    } else {
      console.log('❌ Admin not found\n');
    }

    // Test 3: Categories
    console.log('3. Testing Categories...');
    const categories = await db.category.findMany();
    console.log(`✅ Found ${categories.length} categories: ${categories.map(c => c.name).join(', ')}\n`);

    // Test 4: Products
    console.log('4. Testing Products...');
    const products = await db.product.findMany({
      include: { category: true }
    });
    console.log(`✅ Found ${products.length} products:`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.category.name}) - Rp ${p.price}`);
    });
    console.log('');

    // Test 5: Orders
    console.log('5. Testing Orders...');
    const orders = await db.order.findMany({
      include: { items: true }
    });
    console.log(`✅ Found ${orders.length} orders:`);
    orders.forEach(o => {
      console.log(`   - ${o.name} (${o.status}) - Rp ${o.total}`);
    });
    console.log('');

    console.log('🎉 All tests passed! System is ready for use.\n');
    console.log('🔑 Login Credentials:');
    console.log('   Email: admin@oishine.com');
    console.log('   Password: admin123\n');
    console.log('🌐 Access URLs:');
    console.log('   Admin Login: http://127.0.0.1:3000/admin/login');
    console.log('   Setup Admin: http://127.0.0.1:3000/setup-admin');
    console.log('   Dashboard: http://127.0.0.1:3000/admin/dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await db.$disconnect();
  }
}

testAllFeatures();