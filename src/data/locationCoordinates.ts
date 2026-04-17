export interface LocationCoordinate {
  lat: number;
  lon: number;
}

export interface AreaData {
  name: string;
  coordinates: LocationCoordinate;
  risk: 'High' | 'Medium' | 'Low';
}

export interface LocationData {
  name: string;
  coordinates: LocationCoordinate;
  areas: AreaData[];
}

export const locationDatabase: Record<string, LocationData> = {
  'vile parle': {
    name: 'Vile Parle',
    coordinates: { lat: 19.0993, lon: 72.8465 },
    areas: [
      { name: 'Vile Parle station premises', coordinates: { lat: 19.0993, lon: 72.8345 }, risk: 'Medium' },
      { name: 'Irla market', coordinates: { lat: 19.0993, lon: 72.8445 }, risk: 'Medium' },
      { name: 'Hanuman road', coordinates: { lat: 19.0753, lon: 72.8465 }, risk: 'Low' }
    ]
  },
  'vileparle': {
    name: 'Vile Parle',
    coordinates: { lat: 19.0993, lon: 72.8465 },
    areas: [
      { name: 'Vile Parle station premises', coordinates: { lat: 19.0993, lon: 72.8345 }, risk: 'Medium' },
      { name: 'Irla market', coordinates: { lat: 19.0993, lon: 72.8445 }, risk: 'Medium' },
      { name: 'Hanuman road', coordinates: { lat: 19.0753, lon: 72.8465 }, risk: 'Low' }
    ]
  },
  
  'andheri': {
    name: 'Andheri',
    coordinates: { lat: 19.1195, lon: 72.8469 },
    areas: [
      { name: 'Andheri Railway Station west', coordinates: { lat: 19.1195, lon: 72.8285 }, risk: 'High' },
      { name: 'Dn nagar', coordinates: { lat: 19.0835, lon: 72.8469 }, risk: 'Low' },
      { name: 'Andheri railway east', coordinates: { lat: 19.1195, lon: 72.8653 }, risk: 'Medium' }
    ]
  },
  'andheri railway station': {
    name: 'Andheri Railway Station',
    coordinates: { lat: 19.1195, lon: 72.8469 },
    areas: [
      { name: 'Andheri Railway Station west', coordinates: { lat: 19.1195, lon: 72.8285 }, risk: 'High' },
      { name: 'Andheri railway east', coordinates: { lat: 19.1195, lon: 72.8653 }, risk: 'Medium' },
      { name: 'Station approach road', coordinates: { lat: 19.1198, lon: 72.8475 }, risk: 'Medium' }
    ]
  }
};
