export const PORTFOLIO_SECTIONS = [
  {
    id: 'hero',
    label: 'Home',
    shortLabel: 'HOME',
    index: '00',
    nodeType: 'IDENTITY CORE',
    signal: 'Profile, role, and current development focus.',
    position: [-4, 1.75, 0],
    mapPosition: [23, 31],
    color: '#f3b73d',
    connections: ['about', 'skills', 'projects', 'contact'],
    priority: 'primary',
  },
  {
    id: 'about',
    label: 'About',
    shortLabel: 'ABOUT',
    index: '01',
    nodeType: 'PERSONAL ARCHIVE',
    signal: 'How I approach engineering, systems, and creative work.',
    position: [-0.85, 2.45, -0.35],
    mapPosition: [44, 24],
    color: '#9270ff',
    connections: ['hero', 'background', 'projects'],
    priority: 'standard',
  },
  {
    id: 'skills',
    label: 'Skills',
    shortLabel: 'SKILLS',
    index: '02',
    nodeType: 'CAPABILITY ARRAY',
    signal: 'Frontend, backend, AI, security, cloud, and game systems.',
    position: [2.75, 1.65, 0.15],
    mapPosition: [69, 31],
    color: '#56d98a',
    connections: ['hero', 'background', 'projects'],
    priority: 'standard',
  },
  {
    id: 'background',
    label: 'Background',
    shortLabel: 'ORIGIN',
    index: '03',
    nodeType: 'ORIGIN RECORD',
    signal: 'Education, milestones, and the path into computer science.',
    position: [-2.75, -0.4, 0.25],
    mapPosition: [30, 57],
    color: '#b06bff',
    connections: ['about', 'skills', 'projects'],
    priority: 'standard',
  },
  {
    id: 'projects',
    label: 'Projects',
    shortLabel: 'MISSIONS',
    index: '04',
    nodeType: 'MISSION INDEX',
    signal: 'Selected systems, games, integrations, and project outcomes.',
    position: [0.6, 0.1, 0.75],
    mapPosition: [55, 49],
    color: '#ffd45e',
    connections: ['hero', 'about', 'skills', 'background', 'certificates', 'contact'],
    priority: 'featured',
  },
  {
    id: 'certificates',
    label: 'Certificates',
    shortLabel: 'VAULT',
    index: '05',
    nodeType: 'CREDENTIAL VAULT',
    signal: 'Verified learning records and professional certificates.',
    position: [3.95, -1, -0.25],
    mapPosition: [76, 61],
    color: '#ff9f45',
    connections: ['projects', 'contact'],
    priority: 'standard',
  },
  {
    id: 'contact',
    label: 'Contact',
    shortLabel: 'COMMS',
    index: '06',
    nodeType: 'COMMS RELAY',
    signal: 'Open a secure channel for roles, collaborations, or builds.',
    position: [0, -2.55, 0.2],
    mapPosition: [50, 79],
    color: '#56d98a',
    connections: ['hero', 'projects', 'certificates'],
    priority: 'primary',
  },
];

export const SECTION_BY_ID = new Map(
  PORTFOLIO_SECTIONS.map((section) => [section.id, section])
);

export const PORTFOLIO_CONNECTIONS = PORTFOLIO_SECTIONS.flatMap((section) =>
  section.connections
    .filter((targetId) => section.id < targetId)
    .map((targetId) => [section.id, targetId])
);

export function isPortfolioSection(value) {
  return SECTION_BY_ID.has(value);
}
