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
  { country: 'Japan', code: 'JPN', latitude: 36.2048, longitude: 138.2529 },
  { country: 'Germany', code: 'DEU', latitude: 51.1657, longitude: 10.4515 },
  { country: 'Canada', code: 'CAN', latitude: 56.1304, longitude: -106.3468 },
  { country: 'Brazil', code: 'BRA', latitude: -14.235, longitude: -51.9253 },
  { country: 'Chile', code: 'CHL', latitude: -35.45, longitude: -71.0 },
  { country: 'Iceland', code: 'ISL', latitude: 64.9631, longitude: -19.0208 },
  { country: 'Kenya', code: 'KEN', latitude: -0.0236, longitude: 37.9062 },
  { country: 'Australia', code: 'AUS', latitude: -25.2744, longitude: 133.7751 },
  { country: 'South Korea', code: 'KOR', latitude: 35.9078, longitude: 127.7669 },
  { country: 'New Zealand', code: 'NZL', latitude: -41.5, longitude: 172.8 },
  { country: 'Morocco', code: 'MAR', latitude: 31.7917, longitude: -7.0926 },
  { country: 'Norway', code: 'NOR', latitude: 60.472, longitude: 8.4689 },
  { country: 'India', code: 'IND', latitude: 20.5937, longitude: 78.9629 },
  { country: 'South Africa', code: 'ZAF', latitude: -30.5595, longitude: 22.9375 },
  { country: 'Mexico', code: 'MEX', latitude: 23.6345, longitude: -102.5528 },
  { country: 'Argentina', code: 'ARG', latitude: -38.4161, longitude: -63.6167 },
  { country: 'Indonesia', code: 'IDN', latitude: -1.0, longitude: 114.0 },
  { country: 'Philippines', code: 'PHL', latitude: 11.15, longitude: 122.5 },
  { country: 'Egypt', code: 'EGY', latitude: 26.8206, longitude: 30.8025 },
  { country: 'Turkey', code: 'TUR', latitude: 38.9637, longitude: 35.2433 },
  { country: 'France', code: 'FRA', latitude: 46.2276, longitude: 2.2137 },
  { country: 'United Kingdom', code: 'GBR', latitude: 55.3781, longitude: -3.436 },
  { country: 'United States', code: 'USA', latitude: 39.8283, longitude: -98.5795 },
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
