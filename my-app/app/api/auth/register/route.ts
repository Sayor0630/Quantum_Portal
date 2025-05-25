import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import User from '@/server/models/User';
import { hashPassword } from '@/server/utils/authUtils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields (name, email, password).' }, { status: 400 });
    }
    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    // Basic email format validation (can be more sophisticated)
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      name,
      email,
      hashedPassword,
      roles: ['customer'], // Default role
    });

    await newUser.save();

    // Return user data (excluding password)
    // newUser.toObject() is a good way to get a plain JS object if needed
    const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };

    return NextResponse.json(userResponse, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Registration error:', error);
    // Check for Mongoose validation error
    if (error instanceof Error && error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Validation Error', errors: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
