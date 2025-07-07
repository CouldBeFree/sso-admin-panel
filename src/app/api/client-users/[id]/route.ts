import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth-options';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// DELETE /api/client-users/[id] - Delete a client user
export async function DELETE(
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
    
    // Only allow SuperAdmin and Admin roles to delete client users
    if (!['SuperAdmin', 'Admin'].includes(currentUser.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if the client user exists
    const clientUser = await prisma.clientUser.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
    
    if (!clientUser) {
      return NextResponse.json({ error: 'Client user not found' }, { status: 404 });
    }
    
    // Check if the current user is the owner of the client or a SuperAdmin
    if (currentUser.role.name !== 'SuperAdmin' && clientUser.client.ownerId !== currentUser.id) {
      return NextResponse.json({ error: 'You do not have permission to remove users from this client' }, { status: 403 });
    }
    
    // Delete the client user
    await prisma.clientUser.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
