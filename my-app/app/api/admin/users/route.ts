import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import User from '@/server/models/User'; // Assuming your User model is correctly defined
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET all users (with pagination)
export async function GET(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  try {
    await dbConnect();
    
    // Fetch users, excluding hashedPassword
    // Sorting by createdAt descending to show newest users first
    const users = await User.find({})
      .select('-hashedPassword') // Exclude hashedPassword
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for plain JS objects, good for read-only operations

    const totalUsers = await User.countDocuments({});
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error while fetching users.' }, { status: 500 });
  }
}
