import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth-options';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/clients/[id] - Get a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    // Find the client
    const client = await prisma.client.findUnique({
      where: { id },
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

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Look up the user by email since session doesn't have ID
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
    
    // Check if the user has permission to view this client
    if (
      session.user.role !== 'SuperAdmin' &&
      client.ownerId !== user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { name, description, scopes, grant_types } = body;

    // Find the client first to check ownership
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Look up the user by email since session doesn't have ID
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
    
    // Check if the user has permission to update this client
    if (
      session.user.role !== 'SuperAdmin' &&
      client.ownerId !== user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    // Update the client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: name || client.name,
        description: description !== undefined ? description : client.description,
        scopes: scopes || client.scopes,
        grant_types: grant_types || client.grant_types,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    // Find the client first to check ownership
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Look up the user by email since session doesn't have ID
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
    
    // Check if the user has permission to delete this client
    if (
      session.user.role !== 'SuperAdmin' &&
      client.ownerId !== user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the client
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
