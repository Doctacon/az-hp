const TILE_BASE = '/data'

export const SOURCES = {
  basemap: {
    type: 'vector',
    url: `pmtiles://${TILE_BASE}/basemap.pmtiles`,
    attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
  },
  roads: {
    type: 'vector',
    url: `pmtiles://${TILE_BASE}/roads.pmtiles`,
  },
  places: {
    type: 'vector',
    url: `pmtiles://${TILE_BASE}/places.pmtiles`,
  },
  'hunt-units': {
    type: 'vector',
    url: `pmtiles://${TILE_BASE}/hunt-units.pmtiles`,
  },
  'land-ownership': {
    type: 'vector',
    url: `pmtiles://${TILE_BASE}/land-ownership.pmtiles`,
  },
}
