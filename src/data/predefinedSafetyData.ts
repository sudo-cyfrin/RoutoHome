import { SafetyAssessment, SafetyArea } from '../services/safetyService';
import { locationDatabase as coordDatabase } from './locationCoordinates';
import { calculateDistance, formatDistance } from '../utils/distanceCalculator';

const recommendationDatabase: Record<string, string> = {
  'vile parle': "Vile Parle is generally safe during daytime. Exercise normal precautions and stay aware of surroundings.",
  'vileparle': "Vile Parle is generally safe during daytime. Exercise normal precautions and stay aware of surroundings.",
  'andheri': "Andheri is busy commercial area. Stay alert in crowded places and avoid isolated areas at night.",
  'andheri railway station': "Andheri Railway Station area is very crowded. Keep valuables secure and be aware of pickpockets."
};

export function getPredefinedSafetyData(location: string): SafetyAssessment | null {
  // Convert to lowercase for case-insensitive matching
  const normalizedLocation = location.toLowerCase().trim();
  
  // Find matching location data
  let locationData = null;
  let recommendation = "";
  
  // Check for exact match first
  if (coordDatabase[normalizedLocation]) {
    locationData = coordDatabase[normalizedLocation];
    recommendation = recommendationDatabase[normalizedLocation] || "Stay alert and use well-lit routes.";
  } else {
    // Check for partial matches
    for (const [key, data] of Object.entries(coordDatabase)) {
      if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
        locationData = data;
        recommendation = recommendationDatabase[key] || "Stay alert and use well-lit routes.";
        break;
      }
    }
  }
  
  if (!locationData) {
    return null;
  }
  
  // Calculate distances dynamically
  const proneAreas: SafetyArea[] = locationData.areas.map(area => {
    const distance = calculateDistance(
      locationData.coordinates.lat,
      locationData.coordinates.lon,
      area.coordinates.lat,
      area.coordinates.lon
    );
    
    console.log('Distance calculation:', {
      from: locationData.coordinates,
      to: area.coordinates,
      distance: distance,
      formatted: formatDistance(distance)
    });
    
    return {
      name: area.name,
      distance: formatDistance(distance),
      risk: area.risk
    };
  });
  
  return {
    recommendation,
    proneAreas
  };
}
