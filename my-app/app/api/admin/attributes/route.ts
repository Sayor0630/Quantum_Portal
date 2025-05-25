import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition';
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';

// GET all custom attribute definitions
export async function GET(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  try {
    await dbConnect();
    const attributes = await CustomAttributeDefinition.find({}).sort({ createdAt: -1 });
    return NextResponse.json(attributes, { status: 200 });
  } catch (error) {
    console.error('Error fetching custom attributes:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST a new custom attribute definition
export async function POST(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
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
      // If it's already an array, filter out empty strings and trim
      parsedPossibleValues = possibleValuesInput.map(val => String(val).trim()).filter(val => val !== '');
    }
    // If possibleValuesInput is undefined or an empty string, parsedPossibleValues remains [] which is acceptable

    // Check for duplicate name
    const existingAttribute = await CustomAttributeDefinition.findOne({ name: name.trim() });
    if (existingAttribute) {
        return NextResponse.json({ message: `Attribute with name "${name.trim()}" already exists.` }, { status: 409 });
    }

    const newAttribute = new CustomAttributeDefinition({
      name: name.trim(),
      possibleValues: parsedPossibleValues,
    });

    await newAttribute.save();
    return NextResponse.json(newAttribute, { status: 201 });

  } catch (error: any) {
    console.error('Error creating custom attribute:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
