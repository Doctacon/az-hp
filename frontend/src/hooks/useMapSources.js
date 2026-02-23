import { useEffect } from 'react'
import { SOURCES } from '../config/sources'

export function useMapSources(map, isLoaded) {
  useEffect(() => {
    if (!map || !isLoaded) return

    Object.entries(SOURCES).forEach(([id, config]) => {
      if (!map.getSource(id)) {
        map.addSource(id, config)
      }
    })
  }, [map, isLoaded])
}
