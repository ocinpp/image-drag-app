import { imageItems } from '../data/images.js';

// Image service - abstraction layer for data fetching
// Can easily be switched to API calls in the future

export class ImageService {
  // Get all images - currently returns static data
  // TODO: Replace with API call when backend is ready
  static async getImages() {
    try {
      // Simulate API delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return static data for now
      return {
        success: true,
        data: [...imageItems] // Return a copy to avoid mutations
      };
      
      // Future API implementation would look like:
      // const response = await fetch('/api/images');
      // const data = await response.json();
      // return { success: true, data };
      
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
  
  // Add a new image - placeholder for future API integration
  static async addImage(imageData) {
    try {
      // TODO: Replace with API call
      // const response = await fetch('/api/images', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(imageData)
      // });
      // return await response.json();
      
      return {
        success: true,
        data: { ...imageData, id: Date.now() }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}