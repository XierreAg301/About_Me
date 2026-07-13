export const NODE_PRESENTATION = {
  hero: {
    accent: '#f7f4ff',
    modelIndex: 0,
    artifact: 'Orbital identity archive',
  },
  about: {
    accent: '#b56cff',
    modelIndex: 1,
    artifact: 'Personal signal core',
  },
  skills: {
    accent: '#4da8ff',
    modelIndex: 2,
    artifact: 'Capability stack',
  },
  background: {
    accent: '#ff4fb8',
    modelIndex: 3,
    artifact: 'Origin shield',
  },
  projects: {
    accent: '#8b63ff',
    modelIndex: 4,
    artifact: 'Mission lattice',
  },
  certificates: {
    accent: '#43d5ff',
    modelIndex: 1,
    artifact: 'Credential vault',
  },
  contact: {
    accent: '#f05cff',
    modelIndex: 2,
    artifact: 'Communications relay',
  },
};

export function nodePresentationFor(sectionId) {
  return NODE_PRESENTATION[sectionId] ?? NODE_PRESENTATION.hero;
}
