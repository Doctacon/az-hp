import { useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { INTERACTIVE_LAYERS } from '../config/layers'

export function useMapInteractions(map, isLoaded) {
  const [selectedUnit, setSelectedUnit] = useState(null)

  useEffect(() => {
    if (!map || !isLoaded) return

    const handleHuntUnitClick = (e) => {
      const props = e.features[0].properties
      setSelectedUnit(props)
    }

    const handleRoadClick = (e) => {
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
        .addTo(map)
    }

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
    }

    map.on('click', 'hunt-units-fill', handleHuntUnitClick)
    map.on('click', 'roads-line', handleRoadClick)

    INTERACTIVE_LAYERS.forEach(layerId => {
      map.on('mouseenter', layerId, handleMouseEnter)
      map.on('mouseleave', layerId, handleMouseLeave)
    })

    return () => {
      map.off('click', 'hunt-units-fill', handleHuntUnitClick)
      map.off('click', 'roads-line', handleRoadClick)
      INTERACTIVE_LAYERS.forEach(layerId => {
        map.off('mouseenter', layerId, handleMouseEnter)
        map.off('mouseleave', layerId, handleMouseLeave)
      })
    }
  }, [map, isLoaded])

  return { selectedUnit, setSelectedUnit }
}
