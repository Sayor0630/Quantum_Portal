import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import User from '@/server/models/User';
import { comparePassword } from '@/server/utils/authUtils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return NextResponse.json({ message: 'Authentication configuration error.' }, { status: 500 });
  }

  try {
    await dbConnect();

    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields (email, password).' }, { status: 400 });
    }

    // Find user by email, ensure hashedPassword is selected
    const user = await User.findOne({ email }).select('+hashedPassword');
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 }); // Unauthorized
    }

    // Compare password
    // User.hashedPassword will be defined here due to .select('+hashedPassword')
    // but we need to assert it for TypeScript if the model doesn't guarantee it.
    // However, our IUser interface makes hashedPassword optional, so we need a check.
    if (!user.hashedPassword) {
        console.error(`User ${email} found but has no hashedPassword.`);
        return NextResponse.json({ message: 'Authentication error: User account not properly configured.' }, { status: 500 });
    }

    const isMatch = await comparePassword(password, user.hashedPassword);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 }); // Unauthorized
    }

    // Generate JWT
    const payload = {
      userId: user._id,
      roles: user.roles,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Expires in 7 days

    // Return token and user data (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ token, user: userResponse }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
