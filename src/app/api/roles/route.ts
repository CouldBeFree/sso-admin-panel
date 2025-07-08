import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth-options';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user to check their role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Only allow SuperAdmin and Admin roles to access roles
    if (!['SuperAdmin', 'Admin'].includes(currentUser.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // SuperAdmin can see all roles, Admin can see only Admin and user roles
    let whereClause = {};
    if (currentUser.role.name === 'Admin') {
      whereClause = {
        name: {
          in: ['Admin', 'user'],
        },
      };
    }
    
    const roles = await prisma.role.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
