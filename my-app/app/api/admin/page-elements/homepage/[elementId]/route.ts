import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import PageElement from '@/server/models/PageElement';
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import mongoose from 'mongoose';

// PUT (update) a specific homepage element by ID
export async function PUT(req: NextRequest, { params }: { params: { elementId: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { elementId } = params;
  if (!mongoose.Types.ObjectId.isValid(elementId)) {
    return NextResponse.json({ message: 'Invalid element ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    // We only allow updating config, elementType, and order. pageIdentifier should not change.
    const { elementType, config, order } = body;

    const updateData: any = {};
    if (elementType !== undefined) {
      if (typeof elementType !== 'string' || elementType.trim() === '') {
        return NextResponse.json({ message: 'Element type must be a non-empty string if provided.' }, { status: 400 });
      }
      updateData.elementType = elementType.trim();
    }
    if (config !== undefined) {
      if (typeof config !== 'object' || config === null) { // Config can be an empty object {}
        return NextResponse.json({ message: 'Config must be an object if provided.' }, { status: 400 });
      }
      updateData.config = config;
    }
    if (order !== undefined) {
      if (typeof order !== 'number') {
        return NextResponse.json({ message: 'Order must be a number if provided.' }, { status: 400 });
      }
      updateData.order = order;
    }
    
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No valid fields provided for update.' }, { status: 400 });
    }


    const updatedElement = await PageElement.findOneAndUpdate(
      { _id: elementId, pageIdentifier: 'homepage' }, // Ensure we only update homepage elements
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedElement) {
      return NextResponse.json({ message: 'Homepage element not found for update.' }, { status: 404 });
    }
    return NextResponse.json(updatedElement, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating homepage element ${elementId}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a specific homepage element by ID
export async function DELETE(req: NextRequest, { params }: { params: { elementId: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { elementId } = params;
  if (!mongoose.Types.ObjectId.isValid(elementId)) {
    return NextResponse.json({ message: 'Invalid element ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const deletedElement = await PageElement.findOneAndDelete({ _id: elementId, pageIdentifier: 'homepage' });

    if (!deletedElement) {
      return NextResponse.json({ message: 'Homepage element not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Homepage element deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting homepage element ${elementId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
