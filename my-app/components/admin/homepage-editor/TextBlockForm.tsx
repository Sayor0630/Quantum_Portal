"use client";
import { useState, useEffect } from 'react';

export interface TextBlockConfig {
  content: string; // HTML content or Markdown
}

interface TextBlockFormProps {
  initialConfig: Partial<TextBlockConfig>;
  onSubmit: (config: TextBlockConfig) => void;
  isLoading?: boolean;
}

export default function TextBlockForm({ 
  initialConfig, 
  onSubmit, 
  isLoading 
}: TextBlockFormProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(initialConfig.content || '');
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Reduced padding for modal use */}
      <div>
        <label htmlFor="textContent" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          id="textContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter text, HTML, or Markdown..."
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">For more complex content, consider using HTML or Markdown. Styling will depend on frontend rendering.</p>
      </div>
      
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {isLoading ? 'Saving...' : 'Save Text Block'}
        </button>
      </div>
    </form>
  );
}
