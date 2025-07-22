import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password' },
        { status: 400 }
      );
    }

    // Create Firebase Authentication user
    const userRecord = await auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true, // Auto-verify admin emails
    });

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      message: `Admin user ${name} created successfully`
    });

  } catch (error: any) {
    console.error('Error creating admin:', error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Failed to create admin user';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'כתובת האימייל כבר קיימת במערכת';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'כתובת אימייל לא תקינה';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'הסיסמה חלשה מדי';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}