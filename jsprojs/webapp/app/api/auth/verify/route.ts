import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to verify password for chat access
 * Password is stored in CHAT_PASSWORD environment variable
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const correctPassword = process.env.CHAT_PASSWORD;

    // If no password is set in env, allow access (for development)
    if (!correctPassword) {
      return NextResponse.json(
        { error: 'CHAT_PASSWORD not configured. Access denied.' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      // Set a session cookie (expires in 24 hours)
      const response = NextResponse.json({ success: true });
      response.cookies.set('chat_authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}

/**
 * API route to check if user is authenticated
 */
export async function GET(request: NextRequest) {
  const isAuthenticated = request.cookies.get('chat_authenticated')?.value === 'true';
  return NextResponse.json({ authenticated: isAuthenticated });
}
