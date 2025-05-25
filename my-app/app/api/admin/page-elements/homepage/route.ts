import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import PageElement from '@/server/models/PageElement';
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET all homepage elements
export async function GET(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  try {
    await dbConnect();
    const elements = await PageElement.find({ pageIdentifier: 'homepage' }).sort({ order: 1 }); // Sort by order ascending
    return NextResponse.json(elements, { status: 200 });
  } catch (error) {
    console.error('Error fetching homepage elements:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST a new homepage element
export async function POST(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { elementType, config, order } = body;

    if (!elementType || typeof elementType !== 'string') {
      return NextResponse.json({ message: 'Element type is required and must be a string.' }, { status: 400 });
    }
    if (config === undefined || typeof config !== 'object') { // Allow empty object for config
      return NextResponse.json({ message: 'Config is required and must be an object.' }, { status: 400 });
    }
    if (typeof order !== 'number') {
      return NextResponse.json({ message: 'Order is required and must be a number.' }, { status: 400 });
    }

    const newElement = new PageElement({
      pageIdentifier: 'homepage',
      elementType,
      config,
      order,
    });

    await newElement.save();
    return NextResponse.json(newElement, { status: 201 });

  } catch (error: any) {
    console.error('Error creating homepage element:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT (reorder) homepage elements
export async function PUT(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  try {
    await dbConnect();
    const elementsToReorder: Array<{ _id: string; order: number }> = await req.json();

    if (!Array.isArray(elementsToReorder)) {
      return NextResponse.json({ message: 'Invalid request body. Expected an array of elements to reorder.' }, { status: 400 });
    }

    const operations = elementsToReorder.map(element => {
      if (!mongoose.Types.ObjectId.isValid(element._id) || typeof element.order !== 'number') {
        // Accumulate errors or throw immediately
        throw new Error(`Invalid data for element ID ${element._id}: Order must be a number and ID must be valid.`);
      }
      return {
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(element._id), pageIdentifier: 'homepage' },
          update: { $set: { order: element.order } },
        },
      };
    });

    // Perform bulk write operation
    if (operations.length > 0) {
      const result = await PageElement.bulkWrite(operations as any); // Cast as any to satisfy bulkWrite typing if issues arise
      return NextResponse.json({ message: 'Homepage elements reordered successfully.', modifiedCount: result.modifiedCount }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No elements provided for reordering.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error reordering homepage elements:', error);
    // If error is due to invalid input from map, it's caught here
    if (error.message.startsWith('Invalid data for element')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error during reorder.' }, { status: 500 });
  }
}
