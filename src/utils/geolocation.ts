import axios from 'axios';
import logger from './logger';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Address {
  formatted_address: string;
  latitude: number;
  longitude: number;
}

export const calculateDistance = (
  point1: Coordinates,
  point2: Coordinates
): number => {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<Address> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('Erro ao obter endereço');
    }

    return {
      formatted_address: response.data.results[0].formatted_address,
      latitude,
      longitude,
    };
  } catch (error) {
    logger.error('Erro ao obter endereço:', error);
    throw error;
  }
};

export const validateLocation = (
  userLocation: Coordinates,
  companyLocation: Coordinates
): boolean => {
  const maxDistance = parseInt(process.env.MAX_DISTANCE_METERS || '100');
  const distance = calculateDistance(userLocation, companyLocation);
  return distance <= maxDistance;
}; 