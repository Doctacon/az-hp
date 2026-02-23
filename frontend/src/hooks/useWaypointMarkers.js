import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { WAYPOINT_ICONS } from './useWaypoints'

export function useWaypointMarkers(map, isLoaded, waypoints, onWaypointClick, onWaypointDrag) {
  const markersRef = useRef([])

  useEffect(() => {
    if (!map || !isLoaded) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    waypoints.forEach(wp => {
      const iconSymbol = WAYPOINT_ICONS.find(i => i.id === wp.icon)?.symbol || '📍'
      
      const el = document.createElement('div')
      el.className = 'waypoint-marker'
      el.style.backgroundColor = wp.color
      el.textContent = iconSymbol
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onWaypointClick(wp)
      })

      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([wp.lng, wp.lat])
        .addTo(map)

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        onWaypointDrag(wp.id, lngLat.lng, lngLat.lat)
      })

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [map, isLoaded, waypoints, onWaypointClick, onWaypointDrag])
}

export function useWaypointMapClick(map, isLoaded, onMapDblClick) {
  useEffect(() => {
    if (!map || !isLoaded) return

    const handleDblClick = (e) => {
      onMapDblClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    }

    map.on('dblclick', handleDblClick)

    return () => {
      map.off('dblclick', handleDblClick)
    }
  }, [map, isLoaded, onMapDblClick])
}
