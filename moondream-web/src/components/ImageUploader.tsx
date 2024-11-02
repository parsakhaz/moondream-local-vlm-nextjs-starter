/**
 * ImageUploader Component
 * 
 * A component that handles image upload, preview, description generation,
 * and integration with the Chat component for Q&A functionality.
 * 
 * Features:
 * - Image file selection and preview
 * - Image description generation using Moondream model
 * - Integration with Chat component for Q&A
 * - Loading states and error handling
 */

import { useState } from 'react';
import { describeImage } from '../pages/api/api';
import Chat from './Chat';
import { Button } from './ui/button';
import Image from 'next/image';

const ImageUploader = () => {
  // State management for file, description, and UI states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);  // Key for cached image encoding
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles file selection from input
   * Creates a preview URL and updates state
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a local URL for the selected image preview
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

  /**
   * Handles image description generation
   * Sends image to backend and updates state with response
   */
  const handleDescribe = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      const response = await describeImage(selectedFile);
      setDescription(response.description);
      setImageKey(response.image_key);  // Store key for Q&A
    } catch (error) {
      console.error('Error describing image:', error);
      setDescription('Error describing image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* File Input Area */}
        <div className="w-full max-w-md">
          <label 
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {/* Upload Icon */}
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              {/* Upload Instructions */}
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 800x400px)</p>
            </div>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Image Preview and Chat Container */}
        {imageUrl && selectedFile && (
          <div className="w-full max-w-[1200px] mt-6 space-y-6">
            {/* Description Section - Full Width */}
            <div className="w-full">
              <Button
                onClick={handleDescribe}
                disabled={!selectedFile || isLoading}
                className="w-full mb-4"
              >
                {isLoading ? 'Analyzing...' : 'Describe Image'}
              </Button>

              {description && (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Image Description:</h3>
                  <p className="text-gray-300">{description}</p>
                </div>
              )}
            </div>

            {/* Image and Chat Container */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Image */}
              <div className="w-full lg:w-1/2">
                <div className="relative w-full">
                  <Image 
                    src={imageUrl} 
                    alt="Preview" 
                    width={800}
                    height={400}
                    className="rounded-lg"
                    style={{ width: '100%', height: 'auto' }}
                    priority
                  />
                </div>
              </div>

              {/* Right Column: Chat */}
              {imageKey && (
                <div className="w-full lg:w-1/2">
                  <h3 className="text-xl font-semibold text-white mb-4">Ask questions about this image</h3>
                  <div className="overflow-y-auto">
                    <Chat imageKey={imageKey} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
