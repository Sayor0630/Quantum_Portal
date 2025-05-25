import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/middleware/authMiddleware';
import User from '@/server/models/User';
import dbConnect from '@/server/utils/dbConnect';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req);

  if (authResult.error || !authResult.user) {
    // If error is present, use it, otherwise default to 'Authentication failed.'
    const message = authResult.error || 'Authentication failed.';
    // If status is present, use it, otherwise default to 401
    const status = authResult.status || 401;
    return NextResponse.json({ message }, { status });
  }

  // At this point, authResult.user is guaranteed to be defined.
  const { id: userId } = authResult.user;

  try {
    await dbConnect();
    const user = await User.findById(userId).select('-hashedPassword'); // Exclude password

    if (!user) {
      // This case might occur if the user was deleted after the token was issued
      // but before the optional DB check in authenticateRequest was implemented/enabled.
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Return user data
    // user.toObject() or spreading can be used if further manipulation is needed
    // For now, returning the Mongoose document directly (Next.js handles serialization)
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user for /api/auth/me:', error);
    return NextResponse.json({ message: 'Internal server error while fetching user details.' }, { status: 500 });
  }
}
