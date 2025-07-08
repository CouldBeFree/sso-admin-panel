import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate random email
function generateRandomEmail(): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com', 'company.com', 'mail.com'];
  const firstNames = ['john', 'jane', 'alex', 'sam', 'mike', 'sarah', 'emma', 'david', 'lisa', 'chris', 'anna', 'peter', 'mary', 'robert', 'susan'];
  const lastNames = ['smith', 'johnson', 'williams', 'brown', 'jones', 'miller', 'davis', 'garcia', 'rodriguez', 'wilson', 'martinez', 'anderson', 'taylor', 'thomas', 'moore'];
  
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomFirstName}.${randomLastName}${randomNumber}@${randomDomain}`;
}

async function main() {
  // Create permissions
  const manageAdmins = await prisma.permission.upsert({
    where: { name: 'manage_admins' },
    update: {},
    create: {
      name: 'manage_admins',
      description: 'Can manage admin users',
    },
  });

  const manageUsers = await prisma.permission.upsert({
    where: { name: 'manage_users' },
    update: {},
    create: {
      name: 'manage_users',
      description: 'Can manage regular users',
    },
  });

  const viewAllLogs = await prisma.permission.upsert({
    where: { name: 'view_all_logs' },
    update: {},
    create: {
      name: 'view_all_logs',
      description: 'Can view all system logs',
    },
  });

  const viewLimitedLogs = await prisma.permission.upsert({
    where: { name: 'view_limited_logs' },
    update: {},
    create: {
      name: 'view_limited_logs',
      description: 'Can view limited system logs',
    },
  });

  const configureSystem = await prisma.permission.upsert({
    where: { name: 'configure_system' },
    update: {},
    create: {
      name: 'configure_system',
      description: 'Can configure system settings',
    },
  });

  const basicConfiguration = await prisma.permission.upsert({
    where: { name: 'basic_configuration' },
    update: {},
    create: {
      name: 'basic_configuration',
      description: 'Can perform basic configuration',
    },
  });

  const manageIntegrations = await prisma.permission.upsert({
    where: { name: 'manage_integrations' },
    update: {},
    create: {
      name: 'manage_integrations',
      description: 'Can manage system integrations',
    },
  });

  // Create roles
  // User role with limited permissions
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {
      permissions: {
        connect: [
          { id: viewLimitedLogs.id },
        ],
      },
    },
    create: {
      name: 'user',
      description: 'Regular user with limited permissions',
      permissions: {
        connect: [
          { id: viewLimitedLogs.id },
        ],
      },
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SuperAdmin' },
    update: {
      permissions: {
        connect: [
          { id: manageAdmins.id },
          { id: manageUsers.id },
          { id: viewAllLogs.id },
          { id: configureSystem.id },
          { id: manageIntegrations.id },
        ],
      },
    },
    create: {
      name: 'SuperAdmin',
      description: 'Has full access to all features and can manage Admins',
      permissions: {
        connect: [
          { id: manageAdmins.id },
          { id: manageUsers.id },
          { id: viewAllLogs.id },
          { id: configureSystem.id },
          { id: manageIntegrations.id },
        ],
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      permissions: {
        connect: [
          { id: manageUsers.id },
          { id: viewLimitedLogs.id },
          { id: basicConfiguration.id },
        ],
      },
    },
    create: {
      name: 'Admin',
      description: 'Has limited administrative access',
      permissions: {
        connect: [
          { id: manageUsers.id },
          { id: viewLimitedLogs.id },
          { id: basicConfiguration.id },
        ],
      },
    },
  });

  // Create users
  const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password: hashedSuperAdminPassword,
      roleId: superAdminRole.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Regular Admin',
      password: hashedAdminPassword,
      roleId: adminRole.id,
    },
  });

  // Create 30 random users with user role
  const regularUsers = [];
  
  // Replace the old users with new random emails
  const user1 = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {
      email: generateRandomEmail(),
      name: 'User 1',
      roleId: userRole.id,
    },
    create: {
      email: generateRandomEmail(),
      name: 'User 1',
      password: hashedUserPassword,
      roleId: userRole.id,
    },
  });
  regularUsers.push(user1);

  const user2 = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {
      email: generateRandomEmail(),
      name: 'User 2',
      roleId: userRole.id,
    },
    create: {
      email: generateRandomEmail(),
      name: 'User 2',
      password: hashedUserPassword,
      roleId: userRole.id,
    },
  });
  regularUsers.push(user2);

  const user3 = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    update: {
      email: generateRandomEmail(),
      name: 'User 3',
      roleId: userRole.id,
    },
    create: {
      email: generateRandomEmail(),
      name: 'User 3',
      password: hashedUserPassword,
      roleId: userRole.id,
    },
  });
  regularUsers.push(user3);
  
  // Create additional 27 users to have a total of 30
  for (let i = 4; i <= 30; i++) {
    const randomEmail = generateRandomEmail();
    const user = await prisma.user.upsert({
      where: { email: randomEmail },
      update: {},
      create: {
        email: randomEmail,
        name: `User ${i}`,
        password: hashedUserPassword,
        roleId: userRole.id,
      },
    });
    regularUsers.push(user);
  }

  console.log({ 
    superAdmin, 
    admin, 
    regularUsersCount: regularUsers.length,
    roles: { 
      superAdmin: superAdminRole.name, 
      admin: adminRole.name, 
      user: userRole.name 
    } 
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
