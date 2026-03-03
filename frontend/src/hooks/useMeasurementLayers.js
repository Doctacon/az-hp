import { useEffect } from 'react'

const LINE_SOURCE = 'measurement-line-source'
const LINE_LAYER = 'measurement-line-layer'
const POINTS_SOURCE = 'measurement-points-source'
const POINTS_LAYER = 'measurement-points-layer'

export function useMeasurementLayers(map, isLoaded, points, isActive) {
  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource(LINE_SOURCE)) {
      map.addSource(LINE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!map.getSource(POINTS_SOURCE)) {
      map.addSource(POINTS_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!map.getLayer(LINE_LAYER)) {
      map.addLayer({
        id: LINE_LAYER,
        type: 'line',
        source: LINE_SOURCE,
        paint: {
          'line-color': '#1565c0',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      })
    }

    if (!map.getLayer(POINTS_LAYER)) {
      map.addLayer({
        id: POINTS_LAYER,
        type: 'circle',
        source: POINTS_SOURCE,
        paint: {
          'circle-radius': 6,
          'circle-color': '#1565c0',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
    }

    return () => {
      if (map.getLayer(POINTS_LAYER)) map.removeLayer(POINTS_LAYER)
      if (map.getLayer(LINE_LAYER)) map.removeLayer(LINE_LAYER)
      if (map.getSource(POINTS_SOURCE)) map.removeSource(POINTS_SOURCE)
      if (map.getSource(LINE_SOURCE)) map.removeSource(LINE_SOURCE)
    }
  }, [map, isLoaded])

  useEffect(() => {
    if (!map || !isLoaded) return

    const lineSource = map.getSource(LINE_SOURCE)
    const pointsSource = map.getSource(POINTS_SOURCE)

    if (!lineSource || !pointsSource) return

    if (points.length >= 2) {
      const lineCoords = points.slice()
      lineSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoords,
        },
      })
    } else {
      lineSource.setData({ type: 'FeatureCollection', features: [] })
    }

    const pointsFeatures = points.map((coord, index) => ({
      type: 'Feature',
      properties: { index },
      geometry: {
        type: 'Point',
        coordinates: coord,
      },
    }))
    pointsSource.setData({
      type: 'FeatureCollection',
      features: pointsFeatures,
    })
  }, [map, isLoaded, points])

  useEffect(() => {
    if (!map || !isLoaded) return

    const lineLayer = map.getLayer(LINE_LAYER)
    const pointsLayer = map.getLayer(POINTS_LAYER)

    if (lineLayer) {
      map.setLayoutProperty(LINE_LAYER, 'visibility', isActive ? 'visible' : 'none')
    }
    if (pointsLayer) {
      map.setLayoutProperty(POINTS_LAYER, 'visibility', isActive ? 'visible' : 'none')
    }
  }, [map, isLoaded, isActive])
}

export function useMeasurementClick(map, isLoaded, isActive, addPoint) {
  useEffect(() => {
    if (!map || !isLoaded || !isActive) return

    const handleClick = (e) => {
      e.preventDefault()
      addPoint(e.lngLat.lng, e.lngLat.lat)
    }

    map.on('click', handleClick)

    const canvas = map.getCanvas()
    canvas.style.cursor = 'crosshair'

    return () => {
      map.off('click', handleClick)
      canvas.style.cursor = ''
    }
  }, [map, isLoaded, isActive, addPoint])
}
