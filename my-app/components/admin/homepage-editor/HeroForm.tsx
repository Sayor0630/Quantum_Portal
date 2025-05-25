"use client";
import { useState, useEffect } from 'react';

export interface HeroConfig {
  title: string;
  subtitle: string;
  imageUrl: string; // For now, direct URL input
  buttonText: string;
  buttonLink: string;
}

interface HeroFormProps {
  initialConfig: Partial<HeroConfig>;
  onSubmit: (config: HeroConfig) => void;
  isLoading?: boolean;
}

export default function HeroForm({ initialConfig, onSubmit, isLoading }: HeroFormProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');

  useEffect(() => {
    setTitle(initialConfig.title || '');
    setSubtitle(initialConfig.subtitle || '');
    setImageUrl(initialConfig.imageUrl || '');
    setButtonText(initialConfig.buttonText || '');
    setButtonLink(initialConfig.buttonLink || '');
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, subtitle, imageUrl, buttonText, buttonLink });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Reduced padding for modal use */}
      <div>
        <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="heroTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700">Subtitle</label>
        <input
          type="text"
          id="heroSubtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="heroImageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="url"
          id="heroImageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          placeholder="https://example.com/image.jpg"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
        {/* TODO: Add Cloudinary upload integration here later if direct image upload is desired */}
      </div>
      <div>
        <label htmlFor="heroButtonText" className="block text-sm font-medium text-gray-700">Button Text</label>
        <input
          type="text"
          id="heroButtonText"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="heroButtonLink" className="block text-sm font-medium text-gray-700">Button Link (URL)</label>
        <input
          type="url"
          id="heroButtonLink"
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
          placeholder="/products or https://example.com"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {isLoading ? 'Saving...' : 'Save Hero Element'}
        </button>
      </div>
    </form>
  );
}
