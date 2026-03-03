import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { layers as basemapLayers, namedFlavor } from '@protomaps/basemaps'
import mlcontour from 'maplibre-contour'
import { CONTOUR_LAYERS, OVERLAY_LAYERS, LAYER_GROUPS } from '../config/layers'

const TERRAIN_URL = 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'

let contourSource = null

function setupContourProtocol() {
  if (contourSource) return contourSource
  
  contourSource = new mlcontour.DemSource({
    url: TERRAIN_URL,
    encoding: 'terrarium',
    maxzoom: 12,
    worker: true,
  })
  contourSource.setupMaplibre(maplibregl)
  return contourSource
}

function addBasemapLayers(map) {
  const allBasemapLayers = basemapLayers('basemap', namedFlavor('light'), { lang: 'en' })
  
  const nonLabelLayers = allBasemapLayers.filter(
    layer => layer.type !== 'symbol' && !(layer.id && layer.id.includes('label'))
  )
  
  nonLabelLayers.forEach(layer => {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer)
    }
  })
}

function addTerrainSources(map, demSource) {
  if (!map.getSource('terrain')) {
    map.addSource('terrain', {
      type: 'raster-dem',
      tiles: [demSource.sharedDemProtocolUrl],
      encoding: 'terrarium',
      tileSize: 512,
      maxzoom: 12,
    })
  }
  
  if (!map.getSource('contours')) {
    map.addSource('contours', {
      type: 'vector',
      tiles: [
        demSource.contourProtocolUrl({
          multiplier: 3.28084,
          thresholds: {
            11: [200, 1000],
            12: [100, 500],
            13: [100, 500],
            14: [50, 200],
            15: [20, 100],
          },
          elevationKey: 'ele',
          levelKey: 'level',
          contourLayer: 'contours',
        }),
      ],
      maxzoom: 15,
    })
  }
}

function addHillshadeLayer(map) {
  if (!map.getLayer('hillshade')) {
    map.addLayer({
      id: 'hillshade',
      type: 'hillshade',
      source: 'terrain',
      paint: {
        'hillshade-exaggeration': 0.3,
        'hillshade-shadow-color': '#473B24',
        'hillshade-highlight-color': '#FFFFFF',
        'hillshade-illumination-direction': 315,
      },
    })
  }
}

function addContourLayers(map) {
  CONTOUR_LAYERS.forEach(layer => {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer)
    }
  })
}

function addOverlayLayers(map) {
  OVERLAY_LAYERS.forEach(layerConfig => {
    if (!map.getLayer(layerConfig.id)) {
      map.addLayer(layerConfig)
    }
  })
}

function addBasemapLabelLayers(map) {
  const allBasemapLayers = basemapLayers('basemap', namedFlavor('light'), { lang: 'en' })
  
  const labelLayers = allBasemapLayers.filter(
    layer => layer.type === 'symbol' || (layer.id && (layer.id.includes('label') || layer.id.includes('place') || layer.id.includes('poi')))
  )
  
  labelLayers.forEach(layer => {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer)
    }
  })
}

export function useMapLayers(map, isLoaded, visibility, opacity) {
  const demSourceRef = useRef(null)
  
  useEffect(() => {
    if (!map || !isLoaded) return
    
    demSourceRef.current = setupContourProtocol()

    addBasemapLayers(map)
    addTerrainSources(map, demSourceRef.current)
    addHillshadeLayer(map)
    addOverlayLayers(map)
    addContourLayers(map)
    addBasemapLabelLayers(map)
  }, [map, isLoaded])

  useEffect(() => {
    if (!map || !isLoaded) return

    Object.entries(LAYER_GROUPS).forEach(([groupKey, layerIds]) => {
      const isVisible = visibility[groupKey] ? 'visible' : 'none'
      layerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', isVisible)
        }
      })
    })
  }, [map, isLoaded, visibility])

  useEffect(() => {
    if (!map || !isLoaded) return

    const opacityValue = (key) => (opacity[key] ?? 100) / 100

    if (map.getLayer('hillshade')) {
      map.setPaintProperty('hillshade', 'hillshade-exaggeration', opacityValue('terrain') * 0.3)
    }
    if (map.getLayer('contour-lines')) {
      map.setPaintProperty('contour-lines', 'line-opacity', opacityValue('terrain'))
    }
    if (map.getLayer('land-ownership-fill')) {
      map.setPaintProperty('land-ownership-fill', 'fill-opacity', opacityValue('landOwnership'))
    }
    if (map.getLayer('land-ownership-outline')) {
      map.setPaintProperty('land-ownership-outline', 'line-opacity', opacityValue('landOwnership'))
    }
    if (map.getLayer('hunt-units-fill')) {
      map.setPaintProperty('hunt-units-fill', 'fill-opacity', opacityValue('huntUnits') * 0.2)
    }
    if (map.getLayer('hunt-units-outline')) {
      map.setPaintProperty('hunt-units-outline', 'line-opacity', opacityValue('huntUnits'))
    }
    if (map.getLayer('hunt-units-labels')) {
      map.setPaintProperty('hunt-units-labels', 'text-opacity', opacityValue('huntUnits'))
    }
    if (map.getLayer('roads-line')) {
      map.setPaintProperty('roads-line', 'line-opacity', opacityValue('roads'))
    }
    if (map.getLayer('roads-labels')) {
      map.setPaintProperty('roads-labels', 'text-opacity', opacityValue('roads'))
    }
    if (map.getLayer('places-circle')) {
      map.setPaintProperty('places-circle', 'circle-opacity', opacityValue('places'))
      map.setPaintProperty('places-circle', 'circle-stroke-opacity', opacityValue('places'))
    }
    if (map.getLayer('places-labels')) {
      map.setPaintProperty('places-labels', 'text-opacity', opacityValue('places'))
    }
    if (map.getLayer('water-line')) {
      map.setPaintProperty('water-line', 'line-opacity', opacityValue('water') * 0.7)
    }
    if (map.getLayer('water-labels')) {
      map.setPaintProperty('water-labels', 'text-opacity', opacityValue('water'))
    }
  }, [map, isLoaded, opacity])
}
