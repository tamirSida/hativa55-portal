import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST() {
  try {
    const auth = getAuth();
    const db = getFirestore();

    // Delete existing user
    try {
      await auth.deleteUser('Ho534P7xEuWR8OI6Hw3kgdOu88Q2');
    } catch (error) {
      console.log('User already deleted or does not exist');
    }

    // Delete existing admin record
    try {
      await db.collection('admins').doc('Ho534P7xEuWR8OI6Hw3kgdOu88Q2').delete();
    } catch (error) {
      console.log('Admin record already deleted or does not exist');
    }

    // Create new user
    const userRecord = await auth.createUser({
      email: 'admin@test.com',
      password: 'admin123',
      displayName: 'Test Admin',
      emailVerified: true
    });

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      isAdmin: true,
      role: 'super_admin'
    });

    // Create admin record in Firestore
    const adminData = {
      userId: userRecord.uid,
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'super_admin',
      permissions: [
        'approve_user', 'reject_user', 'delete_user', 'edit_user',
        'view_all_users', 'add_admin', 'edit_admin', 'delete_admin',
        'view_all_businesses', 'edit_business', 'delete_business',
        'manage_tags', 'view_analytics'
      ],
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null
    };

    await db.collection('admins').doc(userRecord.uid).set(adminData);

    return NextResponse.json({
      message: 'New admin created successfully',
      email: 'admin@test.com',
      password: 'admin123',
      uid: userRecord.uid
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}