import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import { MAP_CONFIG } from '../config/map'

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)
maplibregl.prewarm()

export function useMap(containerRef) {
  const mapRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
      cancelPendingTileRequestsWhileZooming: true,
    })

    mapRef.current.on('load', () => {
      setMap(mapRef.current)
      setIsLoaded(true)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [containerRef])

  return { map, isLoaded }
}
