const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EcoConsume AI database...');
  // Check if DB connected
  try {
    const user = await prisma.user.upsert({
      where: { email: 'bima.eco@example.com' },
      update: {},
      create: {
        id: 'usr-001',
        email: 'bima.eco@example.com',
        name: 'Keluarga Bima & Lestari',
        householdSize: 4,
        points: 850,
        wasteScore: 14.2,
      },
    });
    console.log('User created:', user.id);
  } catch (err) {
    console.log('Prisma DB not configured yet or offline, skipping direct DB write.');
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
