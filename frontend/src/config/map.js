export const MAP_CONFIG = {
  center: [-111.75, 34.5],
  zoom: 7,
  maxBounds: [[-115.5, 30.5], [-108.0, 37.5]],
  style: {
    version: 8,
    sources: {},
    layers: [{
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f0ede6' }
    }],
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
  },
}
