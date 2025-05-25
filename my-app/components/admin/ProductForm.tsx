"use client";
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation'; // For potential redirect after submit, though handled by parent
import apiClient from '@/utils/apiClient';
import { ICategory } from '@/server/models/Category';
import { ITag } from '@/server/models/Tag';
import { ICustomAttributeDefinition } from '@/server/models/CustomAttributeDefinition';
import { IProduct, IProductAttribute } from '@/server/models/Product'; // For initialData type

// Define the structure for form data, especially for submission
export interface ProductFormData {
  name: string;
  description: string;
  price: string; // Keep as string for input, convert on submit
  stockQuantity: string; // Keep as string for input, convert on submit
  category?: string; // ObjectId as string
  tags: string[]; // Array of ObjectId strings
  customAttributes: Array<{ definition: string; value: string }>; // definition is ObjectId string
  images?: File[]; // New images to upload
  existingImageUrls?: string[]; // URLs of existing images to keep/reorder
}

interface ProductFormProps {
  initialData?: Partial<IProduct> & { // Making fields optional for create form
    category?: string | { _id: string; name: string }; // Can be ID or populated object
    tags?: Array<string | { _id: string; name: string }>; // Array of IDs or populated objects
    customAttributes?: Array<{ definition: string | { _id: string; name: string; possibleValues?: string[] }; value: string }>;
  };
  onSubmit: (formData: FormData) => Promise<any>; // Parent handles actual FormData submission
  isEditing: boolean;
  submitButtonText?: string;
  isLoading?: boolean;
  error?: string | null;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isEditing,
  submitButtonText,
  isLoading: parentIsLoading,
  error: parentError,
}: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customAttributeValues, setCustomAttributeValues] = useState<Record<string, string>>({}); // { [definitionId]: value }

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [allTags, setAllTags] = useState<ITag[]>([]);
  const [allAttributeDefs, setAllAttributeDefs] = useState<ICustomAttributeDefinition[]>([]);
  
  const [dataLoading, setDataLoading] = useState(true); // For initial data fetch (categories, tags, attributes)
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  const error = parentError !== undefined ? parentError : internalError;
  const isLoading = parentIsLoading !== undefined ? parentIsLoading : internalIsLoading;

  // --- Data Fetching for Selects ---
  const fetchDataForSelects = useCallback(async () => {
    setDataLoading(true);
    try {
      const [catRes, tagRes, attrDefRes] = await Promise.all([
        apiClient<ICategory[]>('/api/admin/categories'),
        apiClient<ITag[]>('/api/admin/tags'),
        apiClient<ICustomAttributeDefinition[]>('/api/admin/attributes'),
      ]);
      if (catRes.data) setAllCategories(catRes.data); else console.error("Failed to load categories:", catRes.error);
      if (tagRes.data) setAllTags(tagRes.data); else console.error("Failed to load tags:", tagRes.error);
      if (attrDefRes.data) setAllAttributeDefs(attrDefRes.data); else console.error("Failed to load attribute definitions:", attrDefRes.error);
    } catch (err) {
      console.error("Error fetching data for form selects:", err);
      setInternalError("Failed to load required data for the form.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataForSelects();
  }, [fetchDataForSelects]);

  // --- Initialize Form with InitialData ---
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price?.toString() || '');
      setStockQuantity(initialData.stockQuantity?.toString() || '');
      
      // Handle category (can be ID or populated object)
      if (initialData.category) {
        setSelectedCategory(typeof initialData.category === 'string' ? initialData.category : initialData.category._id);
      } else {
        setSelectedCategory('');
      }

      // Handle tags (can be array of IDs or populated objects)
      if (initialData.tags) {
        setSelectedTags(
          initialData.tags.map(tag => typeof tag === 'string' ? tag : tag._id)
        );
      } else {
        setSelectedTags([]);
      }

      // Handle custom attributes
      const initialCustomAttrs: Record<string, string> = {};
      if (initialData.customAttributes) {
        initialData.customAttributes.forEach(attr => {
          const defId = typeof attr.definition === 'string' ? attr.definition : attr.definition._id;
          initialCustomAttrs[defId] = attr.value;
        });
      }
      setCustomAttributeValues(initialCustomAttrs);
      
      setExistingImageUrls(initialData.images || []);
      setImageFiles([]); // Clear any stale new image files
      setImagePreviews([]); // Clear stale previews
    }
  }, [initialData]);


  // --- Image Handling ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prevFiles => [...prevFiles, ...filesArray]);

      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...previewsArray]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke object URL for the removed preview to free memory
      URL.revokeObjectURL(prev[index]); 
      return newPreviews;
    });
  };
  
  const removeExistingImage = (urlToRemove: string) => {
    setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };


  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parentIsLoading === undefined) setInternalIsLoading(true);
    if (parentError === undefined) setInternalError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stockQuantity', stockQuantity);
    if (selectedCategory) formData.append('category', selectedCategory);
    
    // Tags: send as JSON string array of IDs
    formData.append('tags', JSON.stringify(selectedTags)); 
    
    // Custom Attributes: send as JSON string array of {definition: ID, value: string}
    const attributesToSubmit = Object.entries(customAttributeValues)
      .filter(([_, value]) => value.trim() !== '') // Only include attributes with a value
      .map(([definitionId, value]) => ({ definition: definitionId, value }));
    formData.append('customAttributes', JSON.stringify(attributesToSubmit));

    // Existing images to keep (order matters if reordering is implemented, for now just send current list)
    formData.append('existingImageUrls', existingImageUrls.join(',')); 

    imageFiles.forEach(file => {
      formData.append('images', file); // Key 'images' for all new files
    });

    try {
      await onSubmit(formData);
      // Success: parent component will handle redirect or message.
      // If this is a create form, consider resetting fields if not redirecting.
      // if (!isEditing) { /* reset form fields */ }
    } catch (err: any) {
      if (parentError === undefined) {
        setInternalError(err.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
      }
    } finally {
      if (parentIsLoading === undefined) setInternalIsLoading(false);
    }
  };
  
  // --- Render ---
  if (dataLoading && !initialData) { // Show loading if fetching categories/tags/attrs for a new form
    return <div className="text-center p-8">Loading form data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 sm:p-6 bg-white rounded-lg shadow-xl">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300 mb-6">{error}</p>}

      {/* Basic Info Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="form-input" disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="form-input" disabled={isLoading} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="form-textarea" disabled={isLoading}></textarea>
          </div>
          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input type="number" id="stockQuantity" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required min="0" step="1" className="form-input" disabled={isLoading} />
          </div>
        </div>
      </section>

      {/* Categorization Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Categorization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="form-select" disabled={isLoading || dataLoading}>
              <option value="">-- Select Category --</option>
              {allCategories.map(cat => <option key={cat._id.toString()} value={cat._id.toString()}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            {dataLoading ? <p className="text-sm text-gray-500">Loading tags...</p> : (
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1 bg-gray-50">
              {allTags.map(tag => (
                <label key={tag._id.toString()} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={tag._id.toString()}
                    checked={selectedTags.includes(tag._id.toString())}
                    onChange={e => {
                      const tagId = e.target.value;
                      setSelectedTags(prev => 
                        e.target.checked ? [...prev, tagId] : prev.filter(id => id !== tagId)
                      );
                    }}
                    className="form-checkbox"
                    disabled={isLoading}
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Custom Attributes Section */}
      {allAttributeDefs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Custom Attributes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allAttributeDefs.map(def => (
              <div key={def._id.toString()}>
                <label htmlFor={`attr-${def._id.toString()}`} className="block text-sm font-medium text-gray-700 mb-1">{def.name}</label>
                {def.possibleValues && def.possibleValues.length > 0 ? (
                  <select
                    id={`attr-${def._id.toString()}`}
                    value={customAttributeValues[def._id.toString()] || ''}
                    onChange={e => setCustomAttributeValues(prev => ({ ...prev, [def._id.toString()]: e.target.value }))}
                    className="form-select"
                    disabled={isLoading || dataLoading}
                  >
                    <option value="">-- Select {def.name} --</option>
                    {def.possibleValues.map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    id={`attr-${def._id.toString()}`}
                    value={customAttributeValues[def._id.toString()] || ''}
                    onChange={e => setCustomAttributeValues(prev => ({ ...prev, [def._id.toString()]: e.target.value }))}
                    className="form-input"
                    disabled={isLoading || dataLoading}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image Upload Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Images</h2>
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">Upload New Images</label>
          <input type="file" id="images" multiple onChange={handleImageChange} className="form-input-file" disabled={isLoading} accept="image/*" />
        </div>
        {/* Previews for new images */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {imagePreviews.map((previewUrl, index) => (
              <div key={index} className="relative group aspect-square border rounded-md overflow-hidden">
                <img src={previewUrl} alt={`New image preview ${index + 1}`} className="object-cover w-full h-full" />
                <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Remove new image">X</button>
              </div>
            ))}
          </div>
        )}
        {/* Display existing images */}
        {isEditing && existingImageUrls.length > 0 && (
            <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Current Images</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {existingImageUrls.map((url, index) => (
                        <div key={url} className="relative group aspect-square border rounded-md overflow-hidden">
                            <img src={url} alt={`Existing image ${index + 1}`} className="object-cover w-full h-full" />
                            <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Remove existing image">X</button>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Removing an existing image here will delete it upon saving.</p>
            </div>
        )}
      </section>

      {/* Submit Button */}
      <div className="pt-6 border-t mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || dataLoading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (isEditing ? 'Updating Product...' : 'Creating Product...') : (submitButtonText || (isEditing ? 'Update Product' : 'Create Product'))}
        </button>
      </div>
      {/* Basic TailwindCSS class placeholders for form inputs */}
      <style jsx global>{`
        .form-input { @apply mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100; }
        .form-textarea { @apply mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100; }
        .form-select { @apply mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white disabled:bg-gray-100; }
        .form-checkbox { @apply h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-70; }
        .form-input-file { @apply mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-3 file:py-2 file:px-3 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-70; }
      `}</style>
    </form>
  );
}
