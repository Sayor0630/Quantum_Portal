import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import Category from '@/server/models/Category';
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET a specific category by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid category ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const category = await Category.findById(id)
      .populate<{ parentCategory: { _id: mongoose.Types.ObjectId; name: string } | null }>({
        path: 'parentCategory',
        select: 'name slug',
      })
      .lean();

    if (!category) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT (update) a specific category by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid category ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { name, parentCategory: parentCategoryId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Category name is required and must be a string.' }, { status: 400 });
    }

    const updateData: { name: string; parentCategory?: mongoose.Types.ObjectId | null } = {
      name: name.trim(),
    };

    if (parentCategoryId === null || parentCategoryId === '') { // Explicitly setting parent to null
      updateData.parentCategory = null;
    } else if (parentCategoryId) {
      if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
        return NextResponse.json({ message: 'Invalid parent category ID format.' }, { status: 400 });
      }
      if (id === parentCategoryId) {
          return NextResponse.json({ message: 'Category cannot be its own parent.' }, { status: 400 });
      }
      const parentExists = await Category.findById(parentCategoryId);
      if (!parentExists) {
        return NextResponse.json({ message: 'Parent category not found.' }, { status: 404 });
      }
      updateData.parentCategory = new mongoose.Types.ObjectId(parentCategoryId);
    }
    // If parentCategoryId is undefined, we don't change the existing parentCategory

    // Slug is auto-updated by pre-save hook if name changes.
    // Mongoose unique index error for 'slug' will be caught below if name change results in duplicate slug.
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ message: 'Category not found for update.' }, { status: 404 });
    }
    
    // Populate parent category for the response
    const populatedCategory = await Category.findById(updatedCategory._id)
      .populate<{ parentCategory: { _id: mongoose.Types.ObjectId; name: string } | null }>({
        path: 'parentCategory',
        select: 'name slug',
      })
      .lean();

    return NextResponse.json(populatedCategory, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating category ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        return NextResponse.json({ message: `A category with this ${field} already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a specific category by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid category ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    
    // Prevent deletion if category is a parent to other categories
    const childCategories = await Category.find({ parentCategory: id });
    if (childCategories.length > 0) {
      return NextResponse.json({ 
        message: 'Cannot delete category. It is a parent to other categories. Please reassign or delete child categories first.' 
      }, { status: 400 });
    }

    // TODO: Add check if category is assigned to any products.
    // This would require importing Product model and querying.
    // For now, this check is omitted as per current scope.
    // Example:
    // const productsWithCategory = await Product.find({ category: id });
    // if (productsWithCategory.length > 0) {
    //   return NextResponse.json({ message: 'Cannot delete category. It is assigned to products.' }, { status: 400 });
    // }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ message: 'Category not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Category deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
