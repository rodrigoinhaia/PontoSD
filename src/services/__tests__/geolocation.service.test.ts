import { GeolocationService } from '../geolocation.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeolocationService', () => {
  let service: GeolocationService;

  beforeEach(() => {
    service = GeolocationService.getInstance();
    jest.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Coordenadas do Rio de Janeiro e São Paulo
      const lat1 = -22.9068;
      const lon1 = -43.1729;
      const lat2 = -23.5505;
      const lon2 = -46.6333;

      const distance = service.calculateDistance(lat1, lon1, lat2, lon2);
      
      // A distância real é aproximadamente 357km
      expect(distance).toBeGreaterThan(350000);
      expect(distance).toBeLessThan(360000);
    });

    it('should return 0 for the same point', () => {
      const lat = -22.9068;
      const lon = -43.1729;

      const distance = service.calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });
  });

  describe('isWithinDistance', () => {
    it('should return true when points are within max distance', () => {
      const lat1 = -22.9068;
      const lon1 = -43.1729;
      const lat2 = -22.9069;
      const lon2 = -43.1730;

      const isWithin = service.isWithinDistance(lat1, lon1, lat2, lon2);
      expect(isWithin).toBe(true);
    });

    it('should return false when points are beyond max distance', () => {
      const lat1 = -22.9068;
      const lon1 = -43.1729;
      const lat2 = -23.5505;
      const lon2 = -46.6333;

      const isWithin = service.isWithinDistance(lat1, lon1, lat2, lon2);
      expect(isWithin).toBe(false);
    });
  });

  describe('getAddress', () => {
    it('should return formatted address for valid coordinates', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [
            {
              formatted_address: 'Rua Teste, 123 - Centro, Rio de Janeiro - RJ'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const address = await service.getAddress(-22.9068, -43.1729);
      expect(address).toBe('Rua Teste, 123 - Centro, Rio de Janeiro - RJ');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/geocode/json')
      );
    });

    it('should throw error when no results are found', async () => {
      const mockResponse = {
        data: {
          status: 'ZERO_RESULTS',
          results: []
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await expect(service.getAddress(-22.9068, -43.1729))
        .rejects
        .toThrow('Endereço não encontrado');
    });
  });

  describe('getCoordinates', () => {
    it('should return coordinates for valid address', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [
            {
              geometry: {
                location: {
                  lat: -22.9068,
                  lng: -43.1729
                }
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const coordinates = await service.getCoordinates('Rua Teste, 123');
      expect(coordinates).toEqual({
        lat: -22.9068,
        lng: -43.1729
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/geocode/json')
      );
    });

    it('should throw error when no results are found', async () => {
      const mockResponse = {
        data: {
          status: 'ZERO_RESULTS',
          results: []
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await expect(service.getCoordinates('Endereço Inexistente'))
        .rejects
        .toThrow('Coordenadas não encontradas');
    });
  });
}); 