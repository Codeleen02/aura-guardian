export const findNearestPolice = async (lat: number, lng: number) => {
  // Overpass API Query: Finds 'police' amenity within 5000 meters of the coords
  const query = `
    [out:json];
    node["amenity"="police"](around:5000, ${lat}, ${lng});
    out body;
  `;
  
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.elements && data.elements.length > 0) {
      // Get the first (closest) result
      const station = data.elements[0];
      return {
        name: station.tags.name || "Nearby Police Station",
        lat: station.lat,
        lng: station.lon,
        address: station.tags["addr:street"] || "Unknown Street"
      };
    }
    return null;
  } catch (error) {
    console.error("Police Search Error:", error);
    return null;
  }
};