import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/utils/dbConnect';
import PageElement from '@/server/models/PageElement';
import Product from '@/server/models/Product'; // Needed for populating product carousels
import Category from '@/server/models/Category'; // For populating product category
import Tag from '@/server/models/Tag'; // For populating product tags
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition'; // For populating product custom attributes

// GET all homepage elements (publicly accessible)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const elements = await PageElement.find({ pageIdentifier: 'homepage' }).sort({ order: 1 }).lean();

    // Populate product details for ProductCarousel elements
    const populatedElements = await Promise.all(
      elements.map(async (element) => {
        if (element.elementType === 'ProductCarousel' && element.config?.productIds && Array.isArray(element.config.productIds)) {
          const productIds = element.config.productIds.filter(id => id); // Filter out any null/empty IDs
          if (productIds.length > 0) {
            const resolvedProducts = await Product.find({
              _id: { $in: productIds },
            })
            .populate({ path: 'category', select: 'name slug' })
            // .populate({ path: 'tags', select: 'name slug' }) // Optional for carousel card
            // .populate({ // Optional for carousel card
            //   path: 'customAttributes.definition',
            //   select: 'name',
            //   model: CustomAttributeDefinition,
            // })
            .select('name slug price images stockQuantity') // Select fields needed for ProductCard
            .lean();
            
            // Order resolvedProducts according to productIds order if necessary (more complex)
            // For now, they'll be in whatever order MongoDB returns them
            return { ...element, config: { ...element.config, resolvedProducts } };
          }
        }
        return element;
      })
    );

    return NextResponse.json(populatedElements, { status: 200 });
  } catch (error) {
    console.error('Error fetching public homepage elements:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
