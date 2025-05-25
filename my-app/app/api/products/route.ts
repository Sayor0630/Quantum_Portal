import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import Product from '@/server/models/Product';
import Category from '@/server/models/Category'; // For finding category by slug
import Tag from '@/server/models/Tag'; // For finding tag by slug
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition'; // For populating
import mongoose from 'mongoose';

// GET all products (public, with pagination and filtering)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10); // Default to 12 per page
  const skip = (page - 1) * limit;

  const categorySlug = searchParams.get('category');
  const tagSlug = searchParams.get('tag');
  const sortOption = searchParams.get('sort') || 'newest';
  // Add more filters like search term, price range later if needed

  const query: mongoose.FilterQuery<typeof Product> = {};

  try {
    await dbConnect();

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug }).select('_id');
      if (category) {
        query.category = category._id;
      } else {
        // Category not found, return empty results for this filter
        return NextResponse.json({ products: [], currentPage: 1, totalPages: 0, totalProducts: 0 }, { status: 200 });
      }
    }

    if (tagSlug) {
      const tag = await Tag.findOne({ slug: tagSlug }).select('_id');
      if (tag) {
        query.tags = { $in: [tag._id] };
      } else {
        // Tag not found, return empty results for this filter
        return NextResponse.json({ products: [], currentPage: 1, totalPages: 0, totalProducts: 0 }, { status: 200 });
      }
    }

    let sortQuery: Record<string, mongoose.SortOrder> = { createdAt: -1 }; // Default: newest
    switch (sortOption) {
      case 'price_asc':
        sortQuery = { price: 1 };
        break;
      case 'price_desc':
        sortQuery = { price: -1 };
        break;
      case 'name_asc':
        sortQuery = { name: 1 };
        break;
      case 'name_desc':
        sortQuery = { name: -1 };
        break;
      // 'newest' is default
    }

    const products = await Product.find(query)
      .populate({ path: 'category', select: 'name slug' })
      .populate({ path: 'tags', select: 'name slug' })
      .populate({
        path: 'customAttributes.definition',
        select: 'name', // Only need name for listing, details page can fetch more
        model: CustomAttributeDefinition,
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
