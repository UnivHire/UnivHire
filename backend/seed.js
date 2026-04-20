const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('1234', 10);
  
  await prisma.user.upsert({
    where: { email: 'hr@demo.com' },
    update: {},
    create: {
      email: 'hr@demo.com',
      name: 'HR Manager',
      passwordHash,
      role: 'HR',
      university: 'Delhi University'
    }
  });

  console.log("Seeded HR User: hr@demo.com / 1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
