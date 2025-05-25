import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import Product from '@/server/models/Product';
import Category from '@/server/models/Category'; // For validation
import Tag from '@/server/models/Tag'; // For validation
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition'; // For validation
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import { uploadToCloudinary } from '@/server/utils/cloudinaryHelper'; // Ensure this path is correct
import mongoose from 'mongoose';

// GET all products (with pagination)
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
    const products = await Product.find({})
      .populate({ path: 'category', select: 'name slug' })
      .populate({ path: 'tags', select: 'name slug' })
      .populate({
        path: 'customAttributes.definition',
        select: 'name',
        model: CustomAttributeDefinition, // Explicitly provide model for population
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments({});
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST a new product
export async function POST(req: NextRequest) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  try {
    await dbConnect();
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const stockQuantityStr = formData.get('stockQuantity') as string;
    const categoryId = formData.get('category') as string | null;
    const tagsStr = formData.get('tags') as string | null; // Expect comma-separated string of IDs or JSON string array
    const customAttributesStr = formData.get('customAttributes') as string | null; // Expect JSON string array of {definition: ID, value: string}

    const imageFiles = formData.getAll('images') as File[];

    // --- Validation ---
    if (!name || name.trim() === '') return NextResponse.json({ message: 'Product name is required.' }, { status: 400 });
    if (isNaN(parseFloat(priceStr))) return NextResponse.json({ message: 'Price must be a valid number.' }, { status: 400 });
    if (isNaN(parseInt(stockQuantityStr, 10))) return NextResponse.json({ message: 'Stock quantity must be a valid integer.' }, { status: 400 });

    const price = parseFloat(priceStr);
    const stockQuantity = parseInt(stockQuantityStr, 10);

    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: 'Invalid category ID format.' }, { status: 400 });
    }
    if(categoryId) {
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) return NextResponse.json({ message: 'Selected category not found.' }, { status: 404 });
    }

    let tagIds: mongoose.Types.ObjectId[] = [];
    if (tagsStr) {
        try {
            const parsedTags = JSON.parse(tagsStr) as string[]; // Assuming JSON array of IDs
            tagIds = parsedTags.map(id => new mongoose.Types.ObjectId(id));
            // Further validation: check if all tag IDs are valid and exist
            for (const tagId of tagIds) {
                if (!mongoose.Types.ObjectId.isValid(tagId.toString())) throw new Error(`Invalid tag ID: ${tagId}`);
                const tagExists = await Tag.findById(tagId);
                if (!tagExists) throw new Error(`Tag with ID ${tagId} not found.`);
            }
        } catch (e: any) {
            return NextResponse.json({ message: `Invalid tags format or non-existent tag: ${e.message}` }, { status: 400 });
        }
    }
    
    let parsedCustomAttributes: { definition: mongoose.Types.ObjectId; value: string }[] = [];
    if (customAttributesStr) {
        try {
            const inputAttributes = JSON.parse(customAttributesStr) as { definition: string; value: string }[];
            for (const attr of inputAttributes) {
                if (!mongoose.Types.ObjectId.isValid(attr.definition)) throw new Error(`Invalid custom attribute definition ID: ${attr.definition}`);
                const definitionExists = await CustomAttributeDefinition.findById(attr.definition);
                if (!definitionExists) throw new Error(`Custom attribute definition with ID ${attr.definition} not found.`);
                // Further validation: check if 'value' is one of 'possibleValues' if definition has them (optional for now)
                parsedCustomAttributes.push({ definition: new mongoose.Types.ObjectId(attr.definition), value: attr.value });
            }
        } catch (e: any) {
            return NextResponse.json({ message: `Invalid custom attributes format or non-existent definition: ${e.message}` }, { status: 400 });
        }
    }

    // --- Image Uploads ---
    const imageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file.size > 0) { // Ensure file is not empty
            const buffer = Buffer.from(await file.arrayBuffer());
            // Consider using product name or a unique ID in filename if desired
            const result = await uploadToCloudinary(buffer, 'products'); 
            if ('secure_url' in result) {
                imageUrls.push(result.secure_url);
            } else {
                console.error('Cloudinary upload failed for a file:', result);
                // Decide if to error out or continue without this image
            }
        }
      }
    }

    const productData = {
      name: name.trim(),
      description: description?.trim(),
      price,
      stockQuantity,
      category: categoryId ? new mongoose.Types.ObjectId(categoryId) : undefined,
      tags: tagIds,
      customAttributes: parsedCustomAttributes,
      images: imageUrls,
      // Slug will be auto-generated
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    // Populate for the response
    const populatedProduct = await Product.findById(newProduct._id)
      .populate({ path: 'category', select: 'name slug' })
      .populate({ path: 'tags', select: 'name slug' })
      .populate({
        path: 'customAttributes.definition',
        select: 'name',
        model: CustomAttributeDefinition,
      })
      .lean();

    return NextResponse.json(populatedProduct, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A product with this slug already exists (likely from the name).' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error while creating product.' }, { status: 500 });
  }
}
