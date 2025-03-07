import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash('111111', 10);

  // Create default users
  const users = [
    {
      username: 'owner',
      name: 'Sarah Owner',
      email: 'owner@restaurant.com',
      password: defaultPassword,
      role: 'OWNER',
      active: true,
    },
    {
      username: 'manager',
      name: 'John Manager',
      email: 'manager@restaurant.com',
      password: defaultPassword,
      role: 'MANAGER',
      active: true,
    },
    {
      username: 'kitchen',
      name: 'Michael Chef',
      email: 'chef@restaurant.com',
      password: defaultPassword,
      role: 'KITCHEN',
      active: true,
    },
    {
      username: 'bar',
      name: 'Lisa Bartender',
      email: 'bar@restaurant.com',
      password: defaultPassword,
      role: 'BAR',
      active: true,
    },
    {
      username: 'waiter',
      name: 'Robert Waiter',
      email: 'waiter@restaurant.com',
      password: defaultPassword,
      role: 'WAITER',
      active: true,
    },
    {
      username: 'waiter2',
      name: 'Jessica Waitress',
      email: 'waiter2@restaurant.com',
      password: defaultPassword,
      role: 'WAITER',
      active: true,
    },
    {
      username: 'receptionist',
      name: 'Emma Host',
      email: 'host@restaurant.com',
      password: defaultPassword,
      role: 'RECEPTIONIST',
      active: true,
    },
    {
      username: 'shisha',
      name: 'Adam Shisha',
      email: 'shisha@restaurant.com',
      password: defaultPassword,
      role: 'SHISHA',
      active: true,
    },
  ];

  // Create each user, skipping if it already exists
  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`Created user: ${userData.username}`);
    } else {
      console.log(`User ${userData.username} already exists`);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 