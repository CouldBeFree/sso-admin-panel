import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth-options';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/clients - Get all clients for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from the session
    const userId = session.user.id;

    // Get clients based on user role
    let clients;
    if (session.user.role === 'SuperAdmin') {
      // SuperAdmin can see all clients
      clients = await prisma.client.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Regular admin can only see their own clients
      clients = await prisma.client.findMany({
        where: {
          ownerId: userId,
        },
      });
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, scopes, grant_types } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate scopes
    const validScopes = ['open_id', 'email', 'profile_with_doc'];
    if (scopes && !scopes.every((scope: string) => validScopes.includes(scope))) {
      return NextResponse.json(
        { error: 'Invalid scopes provided' },
        { status: 400 }
      );
    }

    // Validate grant types
    const validGrantTypes = [
      'authorization_code',
      'implicit',
      'client_credentials',
      'password',
      'refresh_token',
      'device_code',
      'urn:ietf:params:oauth:grant-type:uma-ticket'
    ];
    if (
      grant_types &&
      !grant_types.every((type: string) => validGrantTypes.includes(type))
    ) {
      return NextResponse.json(
        { error: 'Invalid grant types provided' },
        { status: 400 }
      );
    }

    // Generate client_id and client_secret
    const client_id = `client_${Math.random().toString(36).substring(2, 12)}`;
    const client_secret = `secret_${Math.random().toString(36).substring(2, 24)}`;

    console.log({session})
    
    // Find the user by email since session doesn't have ID
    if (!session.user.email) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create the new client
    const newClient = await prisma.client.create({
      data: {
        name,
        description: description || '',
        client_id,
        client_secret,
        scopes: scopes || [],
        grant_types: grant_types || [],
        ownerId: user.id, // Use the looked-up user's ID
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
