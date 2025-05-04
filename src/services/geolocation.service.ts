import axios from 'axios';
import { envConfig } from '../config/env';
import { logger } from '../utils/logger';

export class GeolocationService {
  private static instance: GeolocationService;
  private readonly apiKey: string;
  private readonly maxDistance: number;

  private constructor() {
    this.apiKey = envConfig.geolocation.googleMapsApiKey;
    this.maxDistance = envConfig.geolocation.maxDistanceMeters;
  }

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
   */
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  /**
   * Verifica se um ponto está dentro da distância máxima permitida
   */
  public isWithinDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): boolean {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= this.maxDistance;
  }

  /**
   * Obtém o endereço de um ponto geográfico usando a API do Google Maps
   */
  public async getAddress(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }

      throw new Error('Endereço não encontrado');
    } catch (error) {
      logger.error('Erro ao obter endereço:', error);
      throw new Error('Erro ao obter endereço');
    }
  }

  /**
   * Obtém as coordenadas de um endereço usando a API do Google Maps
   */
  public async getCoordinates(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${this.apiKey}`
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }

      throw new Error('Coordenadas não encontradas');
    } catch (error) {
      logger.error('Erro ao obter coordenadas:', error);
      throw new Error('Erro ao obter coordenadas');
    }
  }
} 