export const PORTFOLIO_SECTIONS = [
  {
    id: 'hero',
    label: 'Home',
    shortLabel: 'HOME',
    index: '00',
    position: [-1.75, 1.55, 0],
    mapPosition: [18, 24],
    connections: ['about', 'skills', 'projects', 'contact'],
    priority: 'primary',
  },
  {
    id: 'about',
    label: 'About',
    shortLabel: 'ABOUT',
    index: '01',
    position: [-0.4, 2.1, 0],
    mapPosition: [43, 14],
    connections: ['hero', 'background', 'projects'],
    priority: 'standard',
  },
  {
    id: 'skills',
    label: 'Skills',
    shortLabel: 'SKILLS',
    index: '02',
    position: [1.2, 1.5, 0],
    mapPosition: [72, 25],
    connections: ['hero', 'background', 'projects'],
    priority: 'standard',
  },
  {
    id: 'background',
    label: 'Background',
    shortLabel: 'ORIGIN',
    index: '03',
    position: [-1.2, -0.3, 0],
    mapPosition: [28, 55],
    connections: ['about', 'skills', 'projects'],
    priority: 'standard',
  },
  {
    id: 'projects',
    label: 'Projects',
    shortLabel: 'MISSIONS',
    index: '04',
    position: [0.3, 0.05, 0.25],
    mapPosition: [55, 49],
    connections: ['hero', 'about', 'skills', 'background', 'certificates', 'contact'],
    priority: 'featured',
  },
  {
    id: 'certificates',
    label: 'Certificates',
    shortLabel: 'VAULT',
    index: '05',
    position: [1.7, -0.85, 0],
    mapPosition: [81, 64],
    connections: ['projects', 'contact'],
    priority: 'standard',
  },
  {
    id: 'contact',
    label: 'Contact',
    shortLabel: 'COMMS',
    index: '06',
    position: [0, -2, 0],
    mapPosition: [50, 84],
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
