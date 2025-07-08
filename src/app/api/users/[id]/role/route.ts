import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth-options';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// PATCH /api/users/[id]/role - Update a user's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Only allow SuperAdmin and Admin roles to update user roles
    if (!['SuperAdmin', 'Admin'].includes(currentUser.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    const data = await request.json();
    const { roleId } = data;
    
    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if the role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });
    
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    // Admins can only update users to 'user' or 'Admin' roles
    if (currentUser.role.name === 'Admin' && role.name === 'SuperAdmin') {
      return NextResponse.json({ error: 'Admins cannot assign SuperAdmin role' }, { status: 403 });
    }
    
    // SuperAdmins cannot be changed by anyone except other SuperAdmins
    if (user.role.name === 'SuperAdmin' && currentUser.role.name !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Only SuperAdmins can modify other SuperAdmins' }, { status: 403 });
    }
    
    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { roleId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
