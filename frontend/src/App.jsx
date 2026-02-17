import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'
import LayerPanel from './components/LayerPanel'
import UnitInfoPanel from './components/UnitInfoPanel'
import './App.css'

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

const TILE_BASE = '/data'

export default function App() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [layers, setLayers] = useState({
    roads: true,
    landOwnership: true,
    huntUnits: true,
    water: true,
    landCover: false,
    buildings: false,
    places: true,
  })

  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [{
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#f0ede6' }
        }],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [-111.75, 34.5],
      zoom: 7,
      maxBounds: [[-115.5, 30.5], [-108.0, 37.5]],
    })

    map.current.on('load', () => {
      addSources()
      addLayers()
      addInteractions()
    })

    return () => map.current?.remove()
  }, [])

  function addSources() {
    const m = map.current

    m.addSource('roads', {
      type: 'vector',
      url: `pmtiles://${TILE_BASE}/roads.pmtiles`,
    })
    m.addSource('water', {
      type: 'vector',
      url: `pmtiles://${TILE_BASE}/water.pmtiles`,
    })
    m.addSource('landcover', {
      type: 'vector',
      url: `pmtiles://${TILE_BASE}/landcover.pmtiles`,
    })
    m.addSource('buildings', {
      type: 'vector',
      url: `pmtiles://${TILE_BASE}/buildings.pmtiles`,
    })
    m.addSource('places', {
      type: 'vector',
      url: `pmtiles://${TILE_BASE}/places.pmtiles`,
    })
    m.addSource('hunt-units', {
      type: 'geojson',
      data: `${TILE_BASE}/azgfd_gmu.geojson`,
    })
    m.addSource('land-ownership', {
      type: 'geojson',
      data: `${TILE_BASE}/blm_sma_az.geojson`,
    })
  }

  function addLayers() {
    const m = map.current

    m.addLayer({
      id: 'landcover-fill',
      type: 'fill',
      source: 'landcover',
      'source-layer': 'landcover',
      paint: {
        'fill-color': [
          'match', ['get', 'subtype'],
          'forest', '#2d5a27',
          'grass', '#a8c686',
          'shrub', '#c4b17c',
          'barren', '#d4c5a0',
          'wetland', '#6b9e8a',
          'crop', '#e8d87c',
          '#ddd'
        ],
        'fill-opacity': 0.4,
      },
    })

    m.addLayer({
      id: 'land-ownership-fill',
      type: 'fill',
      source: 'land-ownership',
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
          '#999'
        ],
        'fill-opacity': 0.25,
      },
    })
    m.addLayer({
      id: 'land-ownership-outline',
      type: 'line',
      source: 'land-ownership',
      paint: {
        'line-color': '#666',
        'line-width': 0.5,
        'line-opacity': 0.5,
      },
    })

    m.addLayer({
      id: 'water-fill',
      type: 'fill',
      source: 'water',
      'source-layer': 'water',
      paint: {
        'fill-color': '#a4cce4',
        'fill-opacity': 0.7,
      },
    })

    m.addLayer({
      id: 'hunt-units-outline',
      type: 'line',
      source: 'hunt-units',
      paint: {
        'line-color': '#d32f2f',
        'line-width': 2,
        'line-dasharray': [4, 2],
      },
    })
    m.addLayer({
      id: 'hunt-units-fill',
      type: 'fill',
      source: 'hunt-units',
      paint: {
        'fill-color': '#d32f2f',
        'fill-opacity': 0.05,
      },
    })
    m.addLayer({
      id: 'hunt-units-labels',
      type: 'symbol',
      source: 'hunt-units',
      layout: {
        'text-field': ['get', 'GMUNAME'],
        'text-size': 14,
        'text-font': ['Open Sans Bold'],
      },
      paint: {
        'text-color': '#b71c1c',
        'text-halo-color': '#fff',
        'text-halo-width': 2,
      },
    })

    m.addLayer({
      id: 'roads-line',
      type: 'line',
      source: 'roads',
      'source-layer': 'roads',
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
    })

    m.addLayer({
      id: 'buildings-fill',
      type: 'fill',
      source: 'buildings',
      'source-layer': 'buildings',
      minzoom: 12,
      paint: {
        'fill-color': '#bbb',
        'fill-opacity': 0.6,
        'fill-outline-color': '#888',
      },
    })

    m.addLayer({
      id: 'places-circle',
      type: 'circle',
      source: 'places',
      'source-layer': 'places',
      paint: {
        'circle-radius': 5,
        'circle-color': '#1565c0',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    })
  }

  function addInteractions() {
    const m = map.current

    m.on('click', 'hunt-units-fill', (e) => {
      const props = e.features[0].properties
      setSelectedUnit(props)
    })

    for (const layer of ['hunt-units-fill', 'roads-line', 'places-circle']) {
      m.on('mouseenter', layer, () => {
        m.getCanvas().style.cursor = 'pointer'
      })
      m.on('mouseleave', layer, () => {
        m.getCanvas().style.cursor = ''
      })
    }

    m.on('click', 'roads-line', (e) => {
      const props = e.features[0].properties
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <strong>${props.road_name || 'Unnamed road'}</strong><br/>
          Class: ${props.class || 'unknown'}<br/>
          Surface: ${props.surface || 'unknown'}<br/>
          Land: ${props.land_status || 'unknown'}<br/>
          Unit: ${props.GMUNAME || 'N/A'}
        `)
        .addTo(m)
    })
  }

  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return
    const layerMap = {
      roads: ['roads-line'],
      landOwnership: ['land-ownership-fill', 'land-ownership-outline'],
      huntUnits: ['hunt-units-outline', 'hunt-units-fill', 'hunt-units-labels'],
      water: ['water-fill'],
      landCover: ['landcover-fill'],
      buildings: ['buildings-fill'],
      places: ['places-circle'],
    }
    for (const [key, ids] of Object.entries(layerMap)) {
      const visibility = layers[key] ? 'visible' : 'none'
      ids.forEach(id => {
        if (map.current.getLayer(id)) {
          map.current.setLayoutProperty(id, 'visibility', visibility)
        }
      })
    }
  }, [layers])

  return (
    <div className="app">
      <div ref={mapContainer} className="map-container" />
      <LayerPanel layers={layers} setLayers={setLayers} />
      {selectedUnit && (
        <UnitInfoPanel
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </div>
  )
}
