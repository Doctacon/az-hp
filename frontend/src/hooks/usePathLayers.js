import { useEffect, useRef } from 'react'

const PATH_SOURCE_ID = 'paths-source'
const CURRENT_PATH_SOURCE_ID = 'current-path-source'
const PATH_LINE_LAYER_ID = 'paths-line-layer'
const PATH_VERTEX_LAYER_ID = 'paths-vertex-layer'
const CURRENT_PATH_LINE_LAYER_ID = 'current-path-line-layer'
const CURRENT_PATH_VERTEX_LAYER_ID = 'current-path-vertex-layer'

export function usePathLayers(map, isLoaded, paths, currentPath) {
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded) return

    if (!initializedRef.current) {
      if (!map.getSource(PATH_SOURCE_ID)) {
        map.addSource(PATH_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
      }
      if (!map.getSource(CURRENT_PATH_SOURCE_ID)) {
        map.addSource(CURRENT_PATH_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
      }

      if (!map.getLayer(PATH_LINE_LAYER_ID)) {
        map.addLayer({
          id: PATH_LINE_LAYER_ID,
          type: 'line',
          source: PATH_SOURCE_ID,
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 3,
            'line-opacity': 0.9,
          },
        })
      }

      if (!map.getLayer(PATH_VERTEX_LAYER_ID)) {
        map.addLayer({
          id: PATH_VERTEX_LAYER_ID,
          type: 'circle',
          source: PATH_SOURCE_ID,
          paint: {
            'circle-radius': 5,
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
          },
          filter: ['==', '$type', 'Point'],
        })
      }

      if (!map.getLayer(CURRENT_PATH_LINE_LAYER_ID)) {
        map.addLayer({
          id: CURRENT_PATH_LINE_LAYER_ID,
          type: 'line',
          source: CURRENT_PATH_SOURCE_ID,
          paint: {
            'line-color': '#1565c0',
            'line-width': 3,
            'line-dasharray': [2, 2],
          },
          filter: ['==', 'type', 'line'],
        })
      }

      if (!map.getLayer(CURRENT_PATH_VERTEX_LAYER_ID)) {
        map.addLayer({
          id: CURRENT_PATH_VERTEX_LAYER_ID,
          type: 'circle',
          source: CURRENT_PATH_SOURCE_ID,
          paint: {
            'circle-radius': 6,
            'circle-color': '#1565c0',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
          },
          filter: ['==', 'type', 'vertex'],
        })
      }

      initializedRef.current = true
    }

    const savedFeatures = []
    paths.forEach(path => {
      if (path.coordinates.length >= 2) {
        savedFeatures.push({
          type: 'Feature',
          properties: { color: path.color, pathId: path.id },
          geometry: { type: 'LineString', coordinates: path.coordinates },
        })
      }
      path.coordinates.forEach(coord => {
        savedFeatures.push({
          type: 'Feature',
          properties: { color: path.color, pathId: path.id },
          geometry: { type: 'Point', coordinates: coord },
        })
      })
    })

    const savedSource = map.getSource(PATH_SOURCE_ID)
    if (savedSource) {
      savedSource.setData({
        type: 'FeatureCollection',
        features: savedFeatures,
      })
    }

    const currentFeatures = []
    if (currentPath.length >= 2) {
      currentFeatures.push({
        type: 'Feature',
        properties: { type: 'line' },
        geometry: { type: 'LineString', coordinates: currentPath },
      })
    }
    currentPath.forEach(coord => {
      currentFeatures.push({
        type: 'Feature',
        properties: { type: 'vertex' },
        geometry: { type: 'Point', coordinates: coord },
      })
    })

    const currentSource = map.getSource(CURRENT_PATH_SOURCE_ID)
    if (currentSource) {
      currentSource.setData({
        type: 'FeatureCollection',
        features: currentFeatures,
      })
    }
  }, [map, isLoaded, paths, currentPath])

  return {
    PATH_SOURCE_ID,
    CURRENT_PATH_SOURCE_ID,
  }
}

export function usePathMapClick(map, isLoaded, isDrawing, addVertex) {
  useEffect(() => {
    if (!map || !isLoaded || !isDrawing) return

    const handleClick = (e) => {
      e.preventDefault()
      addVertex(e.lngLat.lng, e.lngLat.lat)
    }

    map.on('click', handleClick)
    map.getCanvas().style.cursor = 'crosshair'

    return () => {
      map.off('click', handleClick)
      map.getCanvas().style.cursor = ''
    }
  }, [map, isLoaded, isDrawing, addVertex])
}
