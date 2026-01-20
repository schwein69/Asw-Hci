import dotenv from "dotenv";
dotenv.config();

const getCoordinatesFromAddress = async (address) => {
  const mapboxToken = process.env.VITE_MAPBOX_TOKEN;
  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address,
  )}.json?access_token=${mapboxToken}&limit=1`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("Address not found");
    }

    // Mapbox returns [longitude, latitude]
    return data.features[0].geometry.coordinates;
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};
