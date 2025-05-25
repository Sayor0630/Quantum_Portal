import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import Product from '@/server/models/Product';
import Category from '@/server/models/Category'; // For validation
import Tag from '@/server/models/Tag'; // For validation
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition'; // For population/validation
import { adminAuthMiddleware } from '@/server/middleware/authMiddleware';
import { uploadToCloudinary } from '@/server/utils/cloudinaryHelper'; // Ensure path is correct
import cloudinary from '@/server/utils/cloudinaryHelper'; // For deleting images
import mongoose from 'mongoose';

// GET a specific product by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const product = await Product.findById(id)
      .populate({ path: 'category', select: 'name slug _id' }) // include _id for pre-selection in form
      .populate({ path: 'tags', select: 'name slug _id' }) // include _id
      .populate({
        path: 'customAttributes.definition',
        select: 'name possibleValues _id', // include _id and possibleValues
        model: CustomAttributeDefinition,
      })
      .lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT (update) a specific product by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found for update.' }, { status: 404 });
    }

    const formData = await req.formData();
    
    // --- Basic Fields ---
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const priceStr = formData.get('price') as string | null;
    const stockQuantityStr = formData.get('stockQuantity') as string | null;
    
    const updateData: any = {}; // Build update object dynamically
    if (name && name.trim() !== '') updateData.name = name.trim();
    if (description !== null) updateData.description = description.trim(); // Allow empty description
    if (priceStr) {
        const price = parseFloat(priceStr);
        if (isNaN(price)) return NextResponse.json({ message: 'Price must be a valid number.' }, { status: 400 });
        updateData.price = price;
    }
    if (stockQuantityStr) {
        const stockQuantity = parseInt(stockQuantityStr, 10);
        if (isNaN(stockQuantity)) return NextResponse.json({ message: 'Stock quantity must be a valid integer.' }, { status: 400 });
        updateData.stockQuantity = stockQuantity;
    }

    // --- Category ---
    const categoryId = formData.get('category') as string | null;
    if (categoryId === '') { // Explicitly setting to no category
        updateData.category = null;
    } else if (categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) return NextResponse.json({ message: 'Invalid category ID format.' }, { status: 400 });
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) return NextResponse.json({ message: 'Selected category not found.' }, { status: 404 });
        updateData.category = new mongoose.Types.ObjectId(categoryId);
    }

    // --- Tags ---
    const tagsStr = formData.get('tags') as string | null; // Expect JSON string array of IDs
    if (tagsStr) {
        try {
            const parsedTags = JSON.parse(tagsStr) as string[];
            updateData.tags = parsedTags.map(tagId => new mongoose.Types.ObjectId(tagId));
            // Add validation for tag existence if needed
        } catch (e) {
            return NextResponse.json({ message: 'Invalid tags format. Expected JSON array of IDs.' }, { status: 400 });
        }
    } else if (formData.has('tags') && tagsStr === '') { // If 'tags' field is present but empty string
        updateData.tags = []; // Clear tags
    }


    // --- Custom Attributes ---
    const customAttributesStr = formData.get('customAttributes') as string | null; // Expect JSON string array of {definition: ID, value: string}
    if (customAttributesStr) {
        try {
            const inputAttributes = JSON.parse(customAttributesStr) as { definition: string; value: string }[];
            updateData.customAttributes = inputAttributes.map(attr => ({
                definition: new mongoose.Types.ObjectId(attr.definition),
                value: attr.value,
            }));
            // Add validation for definition existence if needed
        } catch (e) {
            return NextResponse.json({ message: 'Invalid custom attributes format.' }, { status: 400 });
        }
    }

    // --- Image Handling ---
    const existingImageUrlsStr = formData.get('existingImageUrls') as string | null; // Comma-separated URLs
    const newImageFiles = formData.getAll('images') as File[];
    
    let finalImageUrls: string[] = existingProduct.images || [];

    if (existingImageUrlsStr !== null) { // If this field is present, client is managing existing images
        finalImageUrls = existingImageUrlsStr === '' ? [] : existingImageUrlsStr.split(',');
    }
    
    // (Stretch Goal - Deleting old images from Cloudinary)
    // const imagesToDeleteFromCloudinary = existingProduct.images.filter(url => !finalImageUrls.includes(url));
    // for (const url of imagesToDeleteFromCloudinary) {
    //   try {
    //     const publicId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    //     await cloudinary.uploader.destroy(publicId); // This needs careful public_id extraction logic
    //   } catch (delError) { console.error("Error deleting image from Cloudinary:", delError); }
    // }

    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await uploadToCloudinary(buffer, 'products');
          if ('secure_url' in result) {
            finalImageUrls.push(result.secure_url);
          } else {
            console.error('Cloudinary upload failed for a file during update:', result);
          }
        }
      }
    }
    updateData.images = finalImageUrls;
    
    // --- Update Product ---
    // Slug will be auto-updated by pre-save hook if name changes
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found for update (should not happen if initial check passed).' }, { status: 404 });
    }

    // Populate for response
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate({ path: 'category', select: 'name slug _id' })
      .populate({ path: 'tags', select: 'name slug _id' })
      .populate({
        path: 'customAttributes.definition',
        select: 'name possibleValues _id',
        model: CustomAttributeDefinition,
      })
      .lean();

    return NextResponse.json(populatedProduct, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating product ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A product with this slug already exists (likely from the name).' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error while updating product.' }, { status: 500 });
  }
}

// DELETE a specific product by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await adminAuthMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      return NextResponse.json({ message: 'Product not found for deletion.' }, { status: 404 });
    }

    // (Stretch Goal - Delete images from Cloudinary)
    // if (productToDelete.images && productToDelete.images.length > 0) {
    //   for (const imageUrl of productToDelete.images) {
    //     try {
    //       // This public_id extraction is basic and might need adjustment based on your Cloudinary setup/URL structure
    //       const publicIdWithFolder = imageUrl.split('/').slice(-2).join('/').split('.')[0]; 
    //       if (publicIdWithFolder) {
    //         await cloudinary.uploader.destroy(publicIdWithFolder);
    //       }
    //     } catch (imgDelError) {
    //       console.error(`Failed to delete image ${imageUrl} from Cloudinary:`, imgDelError);
    //       // Decide if to continue or halt deletion process
    //     }
    //   }
    // }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
