import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Clean up existing data ---
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data.');

  // --- Create Test User ---
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Test_1234', salt);
  await prisma.user.create({
    data: {
      email: 'test@erino.io',
      password: hashedPassword,
    },
  });
  console.log(' Created test user: test@erino.io (Password: Test_1234)');

  
  const leadsData = Array.from({ length: 155 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    source: faker.helpers.arrayElement(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
    status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'lost', 'won']),
    score: faker.number.int({ min: 0, max: 100 }),
    lead_value: faker.number.float({ min: 500, max: 25000, multipleOf: 0.01 }),
    last_activity_at: faker.date.recent({ days: 90 }),
    is_qualified: faker.datatype.boolean(),
  }));

  await prisma.lead.createMany({
    data: leadsData,
  });
  console.log(` Created ${leadsData.length} leads.`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });