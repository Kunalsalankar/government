// Geolocation service to detect user's district based on coordinates
// Real Maharashtra district coordinates from CSV data

// All Maharashtra districts with their approximate coordinates
const districtCoordinates = {
  "Maharashtra": {
    "AHMEDNAGAR": { lat: 19.0948, lng: 74.7480 },
    "AKOLA": { lat: 20.7002, lng: 77.0082 },
    "AMRAVATI": { lat: 20.9320, lng: 77.7523 },
    "AURANGABAD": { lat: 19.8762, lng: 75.3433 },
    "BEED": { lat: 18.9894, lng: 75.7566 },
    "BHANDARA": { lat: 21.1704, lng: 79.6522 },
    "BULDHANA": { lat: 20.5310, lng: 76.1846 },
    "CHANDRAPUR": { lat: 19.9615, lng: 79.2961 },
    "DHULE": { lat: 20.9015, lng: 74.7774 },
    "GADCHIROLI": { lat: 20.1809, lng: 80.0131 },
    "GONDIA": { lat: 21.4580, lng: 80.1939 },
    "HINGOLI": { lat: 19.7157, lng: 77.1542 },
    "JALGAON": { lat: 21.0077, lng: 75.5626 },
    "JALNA": { lat: 19.8347, lng: 75.8800 },
    "KOLHAPUR": { lat: 16.7050, lng: 74.2433 },
    "LATUR": { lat: 18.3996, lng: 76.5635 },
    "MUMBAI": { lat: 19.0760, lng: 72.8777 },
    "MUMBAI SUBURBAN": { lat: 19.0728, lng: 72.8826 },
    "NAGPUR": { lat: 21.1458, lng: 79.0882 },
    "NANDED": { lat: 19.1383, lng: 77.3210 },
    "NANDURBAR": { lat: 21.3671, lng: 74.2400 },
    "NASHIK": { lat: 20.0110, lng: 73.7903 },
    "OSMANABAD": { lat: 18.1760, lng: 76.0402 },
    "PALGHAR": { lat: 19.6967, lng: 72.7642 },
    "PARBHANI": { lat: 19.2608, lng: 76.7802 },
    "PUNE": { lat: 18.5204, lng: 73.8567 },
    "RAIGAD": { lat: 18.5204, lng: 73.0200 },
    "RATNAGIRI": { lat: 16.9902, lng: 73.3120 },
    "SANGLI": { lat: 16.8524, lng: 74.5815 },
    "SATARA": { lat: 17.6805, lng: 74.0183 },
    "SINDHUDURG": { lat: 16.0215, lng: 73.5210 },
    "SOLAPUR": { lat: 17.6599, lng: 75.9064 },
    "THANE": { lat: 19.2183, lng: 72.9781 },
    "WARDHA": { lat: 20.7453, lng: 78.5976 },
    "WASHIM": { lat: 20.1110, lng: 77.1380 },
    "YAVATMAL": { lat: 20.3897, lng: 78.1214 }
  }
};

class GeolocationService {
  // Get user's current position
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }
  
  // Find nearest district based on coordinates
  findNearestDistrict(coordinates) {
    let closestDistrict = null;
    let minDistance = Infinity;
    const distances = [];
    
    // Calculate distance to each Maharashtra district
    const maharashtraDistricts = districtCoordinates["Maharashtra"];
    
    Object.entries(maharashtraDistricts).forEach(([districtName, districtCoords]) => {
      const distance = this.calculateDistance(
        coordinates.lat, coordinates.lng,
        districtCoords.lat, districtCoords.lng
      );
      
      distances.push({ district: districtName, distance: distance.toFixed(2) });
      
      if (distance < minDistance) {
        minDistance = distance;
        closestDistrict = districtName;
      }
    });
    
    // Sort distances and log top 5 closest
    distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    console.log('Top 5 closest districts:', distances.slice(0, 5));
    console.log(`Selected: ${closestDistrict} at ${minDistance.toFixed(2)} km`);
    
    // Return the closest district found
    if (closestDistrict) {
      return { 
        state: "Maharashtra", 
        district: closestDistrict 
      };
    }
    
    // Default to PUNE if no match found
    return { 
      state: "Maharashtra", 
      district: "PUNE" 
    };
  }
  
  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }
  
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

const geolocationService = new GeolocationService();
export default geolocationService;