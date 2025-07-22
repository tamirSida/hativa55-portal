import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
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
    
    // Update the admin user with a fresh password
    await auth.updateUser('Ho534P7xEuWR8OI6Hw3kgdOu88Q2', {
      password: 'adminadmin',
      emailVerified: true
    });

    return NextResponse.json({
      message: 'Admin user updated with password: adminadmin',
      email: 'tamirsida25@gmail.com'
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}