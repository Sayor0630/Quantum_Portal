import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition';
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET a specific custom attribute definition by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid attribute ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const attribute = await CustomAttributeDefinition.findById(id);
    if (!attribute) {
      return NextResponse.json({ message: 'Custom attribute definition not found.' }, { status: 404 });
    }
    return NextResponse.json(attribute, { status: 200 });
  } catch (error) {
    console.error(`Error fetching custom attribute ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT (update) a specific custom attribute definition by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid attribute ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { name, possibleValues: possibleValuesInput } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Attribute name is required and must be a string.' }, { status: 400 });
    }

    let parsedPossibleValues: string[] = [];
    if (typeof possibleValuesInput === 'string' && possibleValuesInput.trim() !== '') {
      parsedPossibleValues = possibleValuesInput.split(',').map(val => val.trim()).filter(val => val !== '');
    } else if (Array.isArray(possibleValuesInput)) {
      parsedPossibleValues = possibleValuesInput.map(val => String(val).trim()).filter(val => val !== '');
    }

    // Check for duplicate name, excluding the current document being updated
    const existingAttributeWithSameName = await CustomAttributeDefinition.findOne({ 
        name: name.trim(), 
        _id: { $ne: id } 
    });
    if (existingAttributeWithSameName) {
        return NextResponse.json({ message: `Another attribute with name "${name.trim()}" already exists.` }, { status: 409 });
    }

    const updatedAttribute = await CustomAttributeDefinition.findByIdAndUpdate(
      id,
      { name: name.trim(), possibleValues: parsedPossibleValues },
      { new: true, runValidators: true } // new: true returns the updated document, runValidators ensures schema validation
    );

    if (!updatedAttribute) {
      return NextResponse.json({ message: 'Custom attribute definition not found for update.' }, { status: 404 });
    }
    return NextResponse.json(updatedAttribute, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating custom attribute ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a specific custom attribute definition by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid attribute ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const deletedAttribute = await CustomAttributeDefinition.findByIdAndDelete(id);

    if (!deletedAttribute) {
      return NextResponse.json({ message: 'Custom attribute definition not found for deletion.' }, { status: 404 });
    }
    // TODO: Consider implications for products using this attribute definition.
    // For now, hard delete is implemented.
    return NextResponse.json({ message: 'Custom attribute definition deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting custom attribute ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
