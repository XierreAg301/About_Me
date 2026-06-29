const NODE_CHANNELS = [
  {
    id: 'identity',
    sectionId: 'hero',
    label: 'Identity',
    color: '#f4aa3f',
    nodeType: 'IDENTITY UPLINK',
  },
  {
    id: 'profile',
    sectionId: 'about',
    label: 'Profile',
    color: '#e8eee9',
    nodeType: 'PERSONAL ARCHIVE',
  },
  {
    id: 'capabilities',
    sectionId: 'skills',
    label: 'Capabilities',
    color: '#9ed8cf',
    nodeType: 'CAPABILITY ARRAY',
  },
  {
    id: 'missions',
    sectionId: 'projects',
    label: 'Missions',
    color: '#f06c4f',
    nodeType: 'PROJECT NETWORK',
  },
  {
    id: 'comms',
    sectionId: 'contact',
    label: 'Comms',
    color: '#f5c275',
    nodeType: 'CONTACT RELAY',
  },
];

const COUNTRY_POOL = [
  { country: 'Singapore', code: 'SGP', latitude: 1.3521, longitude: 103.8198 },
  { country: 'Japan', code: 'JPN', latitude: 35.6762, longitude: 139.6503 },
  { country: 'Germany', code: 'DEU', latitude: 52.52, longitude: 13.405 },
  { country: 'Canada', code: 'CAN', latitude: 43.6532, longitude: -79.3832 },
  { country: 'Brazil', code: 'BRA', latitude: -23.5505, longitude: -46.6333 },
  { country: 'Chile', code: 'CHL', latitude: -33.4489, longitude: -70.6693 },
  { country: 'Iceland', code: 'ISL', latitude: 64.1466, longitude: -21.9426 },
  { country: 'Kenya', code: 'KEN', latitude: -1.2921, longitude: 36.8219 },
  { country: 'Australia', code: 'AUS', latitude: -33.8688, longitude: 151.2093 },
  { country: 'South Korea', code: 'KOR', latitude: 37.5665, longitude: 126.978 },
  { country: 'New Zealand', code: 'NZL', latitude: -36.8509, longitude: 174.7645 },
  { country: 'Morocco', code: 'MAR', latitude: 33.5731, longitude: -7.5898 },
  { country: 'Norway', code: 'NOR', latitude: 59.9139, longitude: 10.7522 },
  { country: 'India', code: 'IND', latitude: 19.076, longitude: 72.8777 },
  { country: 'South Africa', code: 'ZAF', latitude: -33.9249, longitude: 18.4241 },
  { country: 'Mexico', code: 'MEX', latitude: 19.4326, longitude: -99.1332 },
  { country: 'Argentina', code: 'ARG', latitude: -34.6037, longitude: -58.3816 },
  { country: 'Indonesia', code: 'IDN', latitude: -6.2088, longitude: 106.8456 },
  { country: 'Philippines', code: 'PHL', latitude: 14.5995, longitude: 120.9842 },
  { country: 'Egypt', code: 'EGY', latitude: 30.0444, longitude: 31.2357 },
  { country: 'Turkey', code: 'TUR', latitude: 41.0082, longitude: 28.9784 },
  { country: 'France', code: 'FRA', latitude: 48.8566, longitude: 2.3522 },
  { country: 'United Kingdom', code: 'GBR', latitude: 51.5072, longitude: -0.1276 },
  { country: 'United States', code: 'USA', latitude: 37.7749, longitude: -122.4194 },
];

function secureRandom() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] / 4294967296;
  }
  return Math.random();
}

export function createRandomWorldNodes() {
  const countries = [...COUNTRY_POOL];
  for (let index = countries.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(secureRandom() * (index + 1));
    [countries[index], countries[swapIndex]] = [countries[swapIndex], countries[index]];
  }

  return NODE_CHANNELS.map((channel, index) => ({
    ...channel,
    ...countries[index],
  }));
}

export { COUNTRY_POOL, NODE_CHANNELS };
