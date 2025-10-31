// Cache service for MGNREGA data
// This service handles caching API responses to ensure the app works offline
// and reduces dependency on the data.gov.in API

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class CacheService {
  constructor() {
    this.cache = {};
    this.loadFromLocalStorage();
  }

  // Load cached data from localStorage
  loadFromLocalStorage() {
    try {
      const savedCache = localStorage.getItem('mgnregaCache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
      this.cache = {};
    }
  }

  // Save cache to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('mgnregaCache', JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }

  // Get data from cache or API
  async getData(key, fetchFunction) {
    // Check if we have valid cached data
    if (this.cache[key] && 
        this.cache[key].timestamp && 
        Date.now() - this.cache[key].timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${key}`);
      return this.cache[key].data;
    }

    // If no valid cache, try to fetch from API
    try {
      console.log(`Fetching fresh data for ${key}`);
      const data = await fetchFunction();
      
      // Update cache with new data
      this.cache[key] = {
        data,
        timestamp: Date.now()
      };
      
      this.saveToLocalStorage();
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${key}:`, error);
      
      // If API fails but we have expired cache, use it as fallback
      if (this.cache[key] && this.cache[key].data) {
        console.log(`Using expired cache as fallback for ${key}`);
        return this.cache[key].data;
      }
      
      throw error;
    }
  }

  // Clear specific cache entry
  clearCache(key) {
    if (key in this.cache) {
      delete this.cache[key];
      this.saveToLocalStorage();
    }
  }

  // Clear all cache
  clearAllCache() {
    this.cache = {};
    this.saveToLocalStorage();
  }
}

// Create singleton instance
const cacheService = new CacheService();
export default cacheService;