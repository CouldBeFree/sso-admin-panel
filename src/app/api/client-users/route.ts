import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth-options';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/client-users - Get all client users
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
    
    // Only allow SuperAdmin and Admin roles to access client users
    if (!['SuperAdmin', 'Admin'].includes(currentUser.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    let clientUsers;
    
    if (currentUser.role.name === 'SuperAdmin') {
      // SuperAdmin can see all client users
      clientUsers = await prisma.clientUser.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              client_id: true,
            },
          },
        },
      });
    } else {
      // Admin can only see client users for clients they own
      clientUsers = await prisma.clientUser.findMany({
        where: {
          client: {
            ownerId: currentUser.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              client_id: true,
            },
          },
        },
      });
    }
    
    return NextResponse.json(clientUsers);
  } catch (error) {
    console.error('Error fetching client users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/client-users - Create a new client user
export async function POST(request: NextRequest) {
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
    
    // Only allow SuperAdmin and Admin roles to create client users
    if (!['SuperAdmin', 'Admin'].includes(currentUser.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const data = await request.json();
    const { clientId, userId, role } = data;
    
    if (!clientId || !userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if the client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if the current user is the owner of the client or a SuperAdmin
    if (currentUser.role.name !== 'SuperAdmin' && client.ownerId !== currentUser.id) {
      return NextResponse.json({ error: 'You do not have permission to assign users to this client' }, { status: 403 });
    }
    
    // Check if the user is already assigned to the client
    const existingClientUser = await prisma.clientUser.findFirst({
      where: {
        clientId,
        userId,
      },
    });
    
    if (existingClientUser) {
      return NextResponse.json({ error: 'User is already assigned to this client' }, { status: 400 });
    }
    
    // Create the client user
    const clientUser = await prisma.clientUser.create({
      data: {
        clientId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            client_id: true,
          },
        },
      },
    });
    
    return NextResponse.json(clientUser);
  } catch (error) {
    console.error('Error creating client user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
