const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating default categories...');

    // Create categories
    const categories = [
      { name: 'Mochi', description: 'Various mochi products' },
      { name: 'Dessert', description: 'Sweet desserts and treats' },
      { name: 'Drinks', description: 'Beverages and drinks' },
      { name: 'Snacks', description: 'Light snacks and appetizers' }
    ];

    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: category.name }
      });

      if (!existing) {
        const created = await prisma.category.create({
          data: category
        });
        console.log(`Created category: ${created.name}`);
      } else {
        console.log(`Category already exists: ${existing.name}`);
      }
    }

    console.log('Default categories created successfully!');
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();