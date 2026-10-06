const axios = require('axios');

const reverseGeocode = async (lat, lng) => {
  if (!lat || !lng) return null;

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en'
      },
      headers: {
        'User-Agent': 'SafeNestApp/1.0'
      }
    });

    if (response.data && response.data.display_name) {
      // Nominatim provides a very long string, let's try to grab a simplified version if possible
      // or just return the full display_name
      const address = response.data.address;
      if (address) {
        // Try to construct a readable short address: "Neighborhood, City"
        const local = address.suburb || address.neighbourhood || address.residential || address.road || '';
        const city = address.city || address.town || address.village || address.county || '';
        
        if (local && city) {
          return `${local}, ${city}`;
        } else if (local) {
          return local;
        } else if (city) {
          return city;
        }
      }
      return response.data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('[Geocoding Service] Failed to reverse geocode:', error.message);
    return null;
  }
};

module.exports = { reverseGeocode };
