// OpenWeatherMap API Service
// Provides real-time weather data for crisis locations to support supply chain logistics

const OPENWEATHER_API_KEY = '8237bb91819a348b3a347b0fe635f881';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  conditions: string;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
  country: string;
  alerts?: string[];
}

export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
  };
  name: string;
}

/**
 * Fetch current weather data for a specific location by coordinates
 */
export async function fetchWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: WeatherResponse = await response.json();
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      visibility: data.visibility / 1000, // Convert to km
      icon: data.weather[0].icon,
      country: data.sys.country,
    };
  } catch (error) {
    // Silently fail - weather data is optional enhancement
    return null;
  }
}

/**
 * Map of country names to their capital cities for better weather API results
 */
const countryCapitals: Record<string, string> = {
  'Ukraine': 'Kyiv',
  'Syria': 'Damascus',
  'Yemen': 'Sana\'a',
  'Afghanistan': 'Kabul',
  'Somalia': 'Mogadishu',
  'South Sudan': 'Juba',
  'Sudan': 'Khartoum',
  'Myanmar': 'Naypyidaw',
  'Ethiopia': 'Addis Ababa',
  'Democratic Republic of the Congo': 'Kinshasa',
  'Nigeria': 'Abuja',
  'Venezuela': 'Caracas',
  'Haiti': 'Port-au-Prince',
  'Lebanon': 'Beirut',
  'Palestine': 'Ramallah',
  'Iraq': 'Baghdad',
  'Libya': 'Tripoli',
  'Mali': 'Bamako',
  'Chad': 'N\'Djamena',
  'Niger': 'Niamey',
  'Burkina Faso': 'Ouagadougou',
  'Central African Republic': 'Bangui',
  'Mozambique': 'Maputo',
  'Zimbabwe': 'Harare',
  'Pakistan': 'Islamabad',
  'Bangladesh': 'Dhaka',
  'Philippines': 'Manila',
  'Colombia': 'Bogota',
  'Turkey': 'Ankara',
  'Jordan': 'Amman',
  'Kenya': 'Nairobi',
  'India': 'New Delhi',
  'China': 'Beijing',
  'Indonesia': 'Jakarta',
  'Brazil': 'Brasilia',
  'Mexico': 'Mexico City',
  'Egypt': 'Cairo',
  'Iran': 'Tehran',
  'Thailand': 'Bangkok',
  'Vietnam': 'Hanoi',
  'Peru': 'Lima',
  'Argentina': 'Buenos Aires',
  'Chile': 'Santiago',
  'Ecuador': 'Quito',
  'Guatemala': 'Guatemala City',
  'Honduras': 'Tegucigalpa',
  'Nicaragua': 'Managua',
  'El Salvador': 'San Salvador',
  'Panama': 'Panama City',
  'Dominican Republic': 'Santo Domingo',
  'Cuba': 'Havana',
  'Bolivia': 'La Paz',
  'Paraguay': 'Asuncion',
  'Uruguay': 'Montevideo',
  'Nepal': 'Kathmandu',
  'Sri Lanka': 'Colombo',
  'Cambodia': 'Phnom Penh',
  'Laos': 'Vientiane',
  'Mongolia': 'Ulaanbaatar',
  'North Korea': 'Pyongyang',
  'South Korea': 'Seoul',
  'Japan': 'Tokyo',
  'Taiwan': 'Taipei',
  'Malaysia': 'Kuala Lumpur',
  'Singapore': 'Singapore',
  'Brunei': 'Bandar Seri Begawan',
  'Timor-Leste': 'Dili',
  'Papua New Guinea': 'Port Moresby',
};

/**
 * Fetch current weather data for a specific city with fallback to capital
 */
export async function fetchWeatherByCity(
  city: string,
  countryCode?: string
): Promise<WeatherData | null> {
  // First try: Use the city name as provided
  let query = countryCode ? `${city},${countryCode}` : city;
  let url = `${BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  
  try {
    let response = await fetch(url);
    
    // If city not found, try capital city if available
    if (!response.ok && response.status === 404 && countryCapitals[city]) {
      const capital = countryCapitals[city];
      query = countryCode ? `${capital},${countryCode}` : capital;
      url = `${BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      response = await fetch(url);
    }
    
    if (!response.ok) {
      // Silently fail for 404s - not all locations have weather data
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: WeatherResponse = await response.json();
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      visibility: data.visibility / 1000, // Convert to km
      icon: data.weather[0].icon,
      country: data.sys.country,
    };
  } catch (error) {
    // Silently fail - weather data is optional enhancement
    // Only log if it's not a 404 or network error
    return null;
  }
}

/**
 * Get weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Determine if weather conditions are hazardous for logistics
 */
export function isHazardousWeather(conditions: string, windSpeed: number, visibility: number): boolean {
  const hazardousConditions = ['Thunderstorm', 'Snow', 'Extreme', 'Tornado', 'Hurricane'];
  const highWind = windSpeed > 50; // km/h
  const lowVisibility = visibility < 1; // km
  
  return hazardousConditions.includes(conditions) || highWind || lowVisibility;
}

/**
 * Get weather severity level for supply chain impact assessment
 */
export function getWeatherSeverity(weather: WeatherData): 'low' | 'medium' | 'high' {
  if (isHazardousWeather(weather.conditions, weather.windSpeed, weather.visibility)) {
    return 'high';
  }
  
  const extremeTemp = weather.temperature > 40 || weather.temperature < -10;
  const moderateWind = weather.windSpeed > 30 && weather.windSpeed <= 50;
  const reducedVisibility = weather.visibility >= 1 && weather.visibility < 5;
  
  if (extremeTemp || moderateWind || reducedVisibility) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Get weather impact description for logistics planning
 */
export function getLogisticsImpact(weather: WeatherData): string {
  const severity = getWeatherSeverity(weather);
  
  if (severity === 'high') {
    return 'Severe weather conditions - expect major supply chain disruptions';
  }
  
  if (severity === 'medium') {
    return 'Challenging weather conditions - plan for potential delays';
  }
  
  return 'Weather conditions favorable for logistics operations';
}
