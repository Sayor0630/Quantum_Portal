"use client";
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/utils/apiClient';
import { IPageElement } from '@/server/models/PageElement'; // Adjust path
import HeroForm, { HeroConfig } from '@/components/admin/homepage-editor/HeroForm';
import ProductCarouselForm, { ProductCarouselConfig } from '@/components/admin/homepage-editor/ProductCarouselForm';
import TextBlockForm, { TextBlockConfig } from '@/components/admin/homepage-editor/TextBlockForm';
// Import other element forms here as they are created

type ElementConfig = HeroConfig | ProductCarouselConfig | TextBlockConfig | Record<string, any>;


// Helper to get a summary of the config for display
const getConfigSummary = (elementType: string, config: ElementConfig): string => {
    switch (elementType) {
        case 'HeroBanner':
            return `Title: ${(config as HeroConfig).title || 'N/A'}, Subtitle: ${(config as HeroConfig).subtitle || 'N/A'}`;
        case 'ProductCarousel':
            return `Title: ${(config as ProductCarouselConfig).title || 'N/A'}, Products: ${(config as ProductCarouselConfig).productIds?.length || 0}`;
        case 'TextBlock':
            const content = (config as TextBlockConfig).content || '';
            return content.length > 50 ? content.substring(0, 50) + '...' : content || 'Empty';
        default:
            return JSON.stringify(config);
    }
};


export default function HomepageEditorPage() {
  const [elements, setElements] = useState<IPageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<IPageElement | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<string>(''); // For 'Add New'

  const fetchHomepageElements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<IPageElement[]>('/api/admin/page-elements/homepage');
      if (response.error || !response.data) {
        throw new Error(response.data?.message as string || response.error || 'Failed to fetch homepage elements.');
      }
      setElements(response.data.sort((a, b) => a.order - b.order)); // Ensure client-side sort by order
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageElements();
  }, [fetchHomepageElements]);

  const openModalForNew = (elementType: string) => {
    setSelectedElementType(elementType);
    setEditingElement(null); // Clear any editing state
    setIsModalOpen(true);
  };

  const openModalForEdit = (element: IPageElement) => {
    setSelectedElementType(element.elementType); // Set type for form rendering
    setEditingElement(element);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingElement(null);
    setSelectedElementType('');
    setError(null); // Clear form-specific errors on modal close
  };

  const handleFormSubmit = async (config: ElementConfig) => {
    setIsLoading(true); // Indicate loading state for form submission
    setError(null);
    
    let response;
    try {
      if (editingElement) { // Update existing element
        response = await apiClient<IPageElement>(`/api/admin/page-elements/homepage/${editingElement._id}`, {
          method: 'PUT',
          body: { 
            elementType: editingElement.elementType, // Type generally shouldn't change on edit
            config, 
            order: editingElement.order // Order is managed separately or passed if form allows
          },
        });
      } else { // Create new element
        // Find max order and add 1, or default to 0 if no elements
        const maxOrder = elements.reduce((max, el) => Math.max(max, el.order), -1);
        response = await apiClient<IPageElement>('/api/admin/page-elements/homepage', {
          method: 'POST',
          body: { 
            elementType: selectedElementType, 
            config, 
            order: maxOrder + 1 
          },
        });
      }

      if (response.error || !response.data) {
        throw new Error(response.data?.message as string || response.error || 'Failed to save element.');
      }
      
      fetchHomepageElements(); // Refresh list
      closeModal();

    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || 'An unexpected error occurred while saving.');
      // Keep modal open to show error, isLoading will be set to false by finally block
    } finally {
      setIsLoading(false); // Reset loading state for form submission
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    if (!confirm('Are you sure you want to delete this page element? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true); // General page loading for delete
    setError(null);
    try {
      const response = await apiClient(`/api/admin/page-elements/homepage/${elementId}`, { method: 'DELETE' });
      if (response.error) {
        throw new Error(response.data?.message as string || response.error || 'Failed to delete element.');
      }
      fetchHomepageElements(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReorder = async (reorderedElements: IPageElement[]) => {
    setIsLoading(true);
    setError(null);
    const orderUpdates = reorderedElements.map((el, index) => ({ _id: el._id.toString(), order: index }));
    try {
        const response = await apiClient('/api/admin/page-elements/homepage', {
            method: 'PUT',
            body: orderUpdates,
        });
        if (response.error) {
            throw new Error(response.data?.message as string || response.error || 'Failed to reorder elements.');
        }
        fetchHomepageElements(); // Refresh to confirm new order
    } catch (err: any) {
        setError(err.message || 'Failed to reorder elements.');
        // Optionally revert to previous order on error, or refetch to get server state
    } finally {
        setIsLoading(false);
    }
  };
  // Basic drag-and-drop reordering (simplified)
  const onDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.dataTransfer.setData("draggedItemIndex", index.toString());
  };
  const onDrop = (e: React.DragEvent<HTMLLIElement>, dropZoneIndex: number) => {
    e.preventDefault();
    const draggedItemIndex = parseInt(e.dataTransfer.getData("draggedItemIndex"), 10);
    if (draggedItemIndex === dropZoneIndex) return;

    const newElements = [...elements];
    const [draggedItem] = newElements.splice(draggedItemIndex, 1);
    newElements.splice(dropZoneIndex, 0, draggedItem);
    
    setElements(newElements); // Optimistic update
    handleReorder(newElements);
  };


  if (isLoading && elements.length === 0) {
    return <div className="p-6 text-center">Loading homepage elements...</div>;
  }

  const renderFormForElement = () => {
    const currentConfig = editingElement ? editingElement.config : {};
    const typeToEdit = editingElement ? editingElement.elementType : selectedElementType;

    switch (typeToEdit) {
      case 'HeroBanner':
        return <HeroForm initialConfig={currentConfig as HeroConfig} onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case 'ProductCarousel':
        return <ProductCarouselForm initialConfig={currentConfig as ProductCarouselConfig} onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case 'TextBlock':
        return <TextBlockForm initialConfig={currentConfig as TextBlockConfig} onSubmit={handleFormSubmit} isLoading={isLoading} />;
      default:
        return <p>Selected element type &quot;{typeToEdit}&quot; has no form configured.</p>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Homepage Content Editor</h1>

      {error && <p className="my-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300">{error}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Add New Element</h2>
        <div className="flex space-x-3 items-center">
            <select 
                onChange={(e) => setSelectedElementType(e.target.value)} 
                value={selectedElementType}
                className="form-select rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
                <option value="">-- Select Element Type --</option>
                <option value="HeroBanner">Hero Banner</option>
                <option value="ProductCarousel">Product Carousel</option>
                <option value="TextBlock">Text Block</option>
                {/* Add other types here */}
            </select>
            <button 
                onClick={() => selectedElementType && openModalForNew(selectedElementType)}
                disabled={!selectedElementType || isLoading}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
            >
                Add Element
            </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Homepage Elements</h2>
      {elements.length === 0 && !isLoading ? (
        <p className="text-gray-500">No elements configured for the homepage yet.</p>
      ) : (
        <ul onDragOver={(e) => e.preventDefault()} className="space-y-3"> {/* Enable drop target */}
          {elements.map((element, index) => (
            <li 
              key={element._id.toString()}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDrop={(e) => onDrop(e, index)}
              onDragOver={(e) => e.preventDefault()} // Important for drop to work
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center cursor-grab"
            >
              <div>
                <span className="font-semibold text-gray-700">{element.elementType}</span> (Order: {element.order})
                <p className="text-sm text-gray-500 truncate max-w-md">{getConfigSummary(element.elementType, element.config)}</p>
              </div>
              <div className="space-x-2 flex-shrink-0">
                <button 
                  onClick={() => openModalForEdit(element)}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteElement(element._id.toString())}
                  disabled={isLoading}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal for Add/Edit Element */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingElement ? `Edit ${editingElement.elementType}` : `Add New ${selectedElementType}`}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-300">{error}</p>}
            {renderFormForElement()}
          </div>
        </div>
      )}
       {/* Basic TailwindCSS class placeholders for form inputs used in this page (if any outside forms) */}
       <style jsx global>{`
        .form-select { @apply mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white disabled:bg-gray-100; }
      `}</style>
    </div>
  );
}
