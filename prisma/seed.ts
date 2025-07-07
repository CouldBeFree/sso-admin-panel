import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  console.log({ superAdmin, admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
