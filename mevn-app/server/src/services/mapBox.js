import dotenv from "dotenv";
dotenv.config();

const getCoordinatesFromAddress = async (address) => {
  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;
  if (!mapboxToken) {
    throw new Error("Missing Mapbox token");
  }
  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address,
  )}.json?access_token=${mapboxToken}&limit=1`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Mapbox API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("Address not found");
    }

    const [longitude, latitude] = data.features[0].geometry.coordinates;

    return {
      longitude,
      latitude,
    };
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

export { getCoordinatesFromAddress };
