import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import Product from '@/server/models/Product';
import Category from '@/server/models/Category'; // Referenced by Product
import Tag from '@/server/models/Tag'; // Referenced by Product
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition'; // Referenced by Product

// GET a specific product by slug (public)
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ message: 'Product slug is required.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const product = await Product.findOne({ slug })
      .populate({ path: 'category', select: 'name slug _id' }) // Include _id for consistency
      .populate({ path: 'tags', select: 'name slug _id' })     // Include _id
      .populate({
        path: 'customAttributes.definition',
        select: 'name possibleValues _id', // Include _id and possibleValues for detail view
        model: CustomAttributeDefinition,
      })
      .lean(); // Use .lean() for plain JS object, good for read-only operations

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
