import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import User, { IUser } from '@/server/models/User'; // Assuming your User model is correctly defined
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET a specific user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid user ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const user = await User.findById(id).select('-hashedPassword'); // Exclude hashedPassword

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error while fetching user.' }, { status: 500 });
  }
}

// PUT (update) a specific user by ID (primarily roles)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error || !authResult.user) { // Ensure authResult.user is available
    return NextResponse.json({ message: authResult.error || 'Authentication failed' }, { status: authResult.status || 401 });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid user ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { roles } = body; // For now, only roles can be updated by admin

    if (!Array.isArray(roles) || !roles.every(role => ['admin', 'customer'].includes(role))) {
      return NextResponse.json({ message: 'Invalid roles array. Roles must be an array containing "admin" or "customer".' }, { status: 400 });
    }
    
    // Optional: Prevent admin from removing their own 'admin' role if they are the only admin.
    // This is a simplified check. A robust check would count total active admins.
    const loggedInAdminId = authResult.user.id;
    if (loggedInAdminId === id && !roles.includes('admin')) {
        const adminCount = await User.countDocuments({ roles: 'admin' });
        if (adminCount <= 1) {
            return NextResponse.json({ message: 'Cannot remove the last administrator role.' }, { status: 400 });
        }
    }


    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { roles: roles } }, // Use $set to update only specified fields
      { new: true, runValidators: true }
    ).select('-hashedPassword');

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found for update.' }, { status: 404 });
    }
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating user ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error while updating user.' }, { status: 500 });
  }
}
