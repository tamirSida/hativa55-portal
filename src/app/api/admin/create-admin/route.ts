import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/AdminService';
import { AdminRole } from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, userId, role = AdminRole.ADMIN } = await request.json();

    if (!email || !name || !password || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password, userId' },
        { status: 400 }
      );
    }

    const adminService = new AdminService();

    // Create the admin document
    const adminId = await adminService.createAdmin(
      {
        userId,
        email,
        name,
        role,
        permissions: [], // Will be set by the service based on role
        isActive: true
      },
      'system' // created by system
    );

    return NextResponse.json({
      success: true,
      adminId,
      message: `Admin user ${name} created successfully`
    });

  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: `Failed to create admin: ${error.message}` },
      { status: 500 }
    );
  }
}