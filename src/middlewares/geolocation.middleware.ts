import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import logger from '../utils/logger';

interface GeolocationResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
}

export const validateGeolocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude and longitude are required.'
      });
    }

    const response = await axios.get<GeolocationResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.results.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid coordinates.'
      });
    }

    req.geolocation = {
      address: response.data.results[0].formatted_address,
      coordinates: {
        latitude: response.data.results[0].geometry.location.lat,
        longitude: response.data.results[0].geometry.location.lng
      }
    };

    next();
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating geolocation.'
    });
  }
}; 