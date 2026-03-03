export const LAYER_GROUPS = {
  terrain: ['hillshade', 'contour-lines'],
  roads: ['roads-line', 'roads-labels'],
  landOwnership: ['land-ownership-fill', 'land-ownership-outline'],
  huntUnits: ['hunt-units-fill', 'hunt-units-outline', 'hunt-units-labels'],
  places: ['places-circle', 'places-labels'],
  water: ['water-line', 'water-labels'],
}

export const DEFAULT_VISIBILITY = {
  terrain: true,
  roads: true,
  landOwnership: true,
  huntUnits: true,
  places: true,
  water: true,
}

export const DEFAULT_OPACITY = {
  terrain: 30,
  roads: 80,
  landOwnership: 25,
  huntUnits: 5,
  places: 100,
  water: 100,
}

export const CONTOUR_LAYERS = [
  {
    id: 'contour-lines',
    type: 'line',
    source: 'contours',
    'source-layer': 'contours',
    paint: {
      'line-color': 'rgba(139, 90, 43, 0.5)',
      'line-width': ['match', ['get', 'level'], 1, 1, 0.5],
    },
  },
]

export const OVERLAY_LAYERS = [
  {
    id: 'land-ownership-fill',
    type: 'fill',
    source: 'land-ownership',
    'source-layer': 'land-ownership',
    group: 'landOwnership',
    minzoom: 8,
    paint: {
      'fill-color': [
        'match', ['get', 'ADMIN_AGENCY_CODE'],
        'BLM', '#ffc107',
        'FS', '#4caf50',
        'NPS', '#8bc34a',
        'FWS', '#00bcd4',
        'BOR', '#2196f3',
        'DOD', '#f44336',
        'STP', '#9c27b0',
        'BIA', '#ff9800',
        '#999'
      ],
      'fill-opacity': 0.25,
      'fill-antialias': false,
    },
  },
  {
    id: 'land-ownership-outline',
    type: 'line',
    source: 'land-ownership',
    'source-layer': 'land-ownership',
    group: 'landOwnership',
    minzoom: 8,
    paint: {
      'line-color': '#666',
      'line-width': 0.5,
      'line-opacity': 0.5,
    },
  },
  {
    id: 'hunt-units-fill',
    type: 'fill',
    source: 'hunt-units',
    'source-layer': 'hunt-units',
    group: 'huntUnits',
    paint: {
      'fill-color': '#d32f2f',
      'fill-opacity': 0.05,
      'fill-antialias': false,
    },
  },
  {
    id: 'hunt-units-outline',
    type: 'line',
    source: 'hunt-units',
    'source-layer': 'hunt-units',
    group: 'huntUnits',
    paint: {
      'line-color': '#d32f2f',
      'line-width': 2,
      'line-dasharray': [4, 2],
    },
  },
  {
    id: 'roads-line',
    type: 'line',
    source: 'roads',
    'source-layer': 'roads',
    group: 'roads',
    minzoom: 9,
    paint: {
      'line-color': [
        'match', ['get', 'land_status'],
        'public_usfs', '#2e7d32',
        'public_blm', '#f9a825',
        'public_nps', '#558b2f',
        'public_fws', '#00897b',
        'public_bor', '#1565c0',
        'restricted_military', '#c62828',
        'state_trust', '#7b1fa2',
        'tribal', '#ff9800',
        '#e65100'
      ],
      'line-width': [
        'match', ['get', 'class'],
        'primary', 3,
        'secondary', 2.5,
        'tertiary', 2,
        'track', 1.5,
        'path', 1,
        'footway', 1,
        1.5
      ],
      'line-opacity': 0.8,
    },
  },
  {
    id: 'roads-labels',
    type: 'symbol',
    source: 'roads',
    'source-layer': 'roads',
    group: 'roads',
    minzoom: 12,
    layout: {
      'text-field': ['get', 'road_name'],
      'text-size': 11,
      'text-font': ['Noto Sans Regular'],
      'symbol-placement': 'line',
      'text-max-angle': 30,
      'text-rotation-alignment': 'map',
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1.5,
    },
  },
  {
    id: 'places-circle',
    type: 'circle',
    source: 'places',
    'source-layer': 'places',
    group: 'places',
    minzoom: 10,
    paint: {
      'circle-radius': 5,
      'circle-color': '#1565c0',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
  },
  {
    id: 'places-labels',
    type: 'symbol',
    source: 'places',
    'source-layer': 'places',
    group: 'places',
    minzoom: 11,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-font': ['Noto Sans Regular'],
      'text-anchor': 'left',
      'text-offset': [0.8, 0],
      'text-optional': true,
    },
    paint: {
      'text-color': '#1565c0',
      'text-halo-color': '#fff',
      'text-halo-width': 1.5,
    },
  },
  {
    id: 'hunt-units-labels',
    type: 'symbol',
    source: 'hunt-units',
    'source-layer': 'hunt-units',
    group: 'huntUnits',
    minzoom: 8,
    layout: {
      'text-field': ['get', 'GMUNAME'],
      'text-size': 14,
      'text-font': ['Noto Sans Bold'],
    },
    paint: {
      'text-color': '#b71c1c',
      'text-halo-color': '#fff',
      'text-halo-width': 2,
    },
  },
  {
    id: 'water-line',
    type: 'line',
    source: 'water',
    'source-layer': 'water',
    group: 'water',
    minzoom: 9,
    paint: {
      'line-color': '#2196f3',
      'line-width': 2,
      'line-opacity': 0.7,
    },
  },
  {
    id: 'water-labels',
    type: 'symbol',
    source: 'water',
    'source-layer': 'water',
    group: 'water',
    minzoom: 10,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-font': ['Noto Sans Italic'],
      'symbol-placement': 'line',
      'text-max-angle': 30,
    },
    paint: {
      'text-color': '#1565c0',
      'text-halo-color': '#fff',
      'text-halo-width': 1.5,
    },
  },
]

export const INTERACTIVE_LAYERS = ['hunt-units-fill', 'roads-line', 'places-circle']
