import dbConnect from '@/server/utils/dbConnect';
import PageElement, { IPageElement } from '@/server/models/PageElement';
import Product, { IProduct } from '@/server/models/Product'; // Needed for populating product carousels
import Category from '@/server/models/Category'; 
import Tag from '@/server/models/Tag'; 
import CustomAttributeDefinition from '@/server/models/CustomAttributeDefinition';

// Define a type for the populated element, especially for ProductCarousel
export interface PopulatedPageElement extends Omit<IPageElement, 'config'> {
  config: {
    // Common config fields
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    content?: string;
    productIds?: string[];
    // Populated fields
    resolvedProducts?: Partial<IProduct>[]; 
  };
}


export async function getHomepageElements(): Promise<PopulatedPageElement[]> {
  await dbConnect();
  // Fetch elements and convert to plain objects immediately if not done by .lean()
  const elements = await PageElement.find({ pageIdentifier: 'homepage' }).sort({ order: 1 }).lean();

  const populatedElements = await Promise.all(
    elements.map(async (elementDoc): Promise<PopulatedPageElement> => {
      // Ensure elementDoc is a plain object and config is also an object
      const element = JSON.parse(JSON.stringify(elementDoc)) as IPageElement;
      
      let populatedConfig = { ...element.config }; // Start with existing config

      if (element.elementType === 'ProductCarousel' && element.config?.productIds && Array.isArray(element.config.productIds)) {
        const productIds = element.config.productIds.filter(id => id); // Filter out any null/empty IDs
        if (productIds.length > 0) {
          const resolvedProducts = await Product.find({
            _id: { $in: productIds },
          })
          .select('name slug price images stockQuantity _id') // Select fields needed for ProductCard
          .lean();
          
          // Create a map for quick lookup to maintain order
          const productMap = new Map(resolvedProducts.map(p => [p._id.toString(), p]));
          // Order resolvedProducts according to productIds
          const orderedResolvedProducts = productIds
            .map(id => productMap.get(id.toString()))
            .filter(p => p !== undefined) as Partial<IProduct>[];

          populatedConfig.resolvedProducts = orderedResolvedProducts;
        } else {
          populatedConfig.resolvedProducts = [];
        }
      }
      
      return {
        ...element,
        _id: element._id.toString(), // Ensure _id is string for components
        config: populatedConfig,
      } as PopulatedPageElement; // Cast to the populated type
    })
  );

  return populatedElements;
}
