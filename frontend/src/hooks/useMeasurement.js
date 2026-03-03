import { useState, useCallback } from 'react'
import * as turf from '@turf/turf'
import { formatDistance } from '../utils/distance'

export function useMeasurement() {
  const [points, setPoints] = useState([])
  const [isActive, setIsActive] = useState(false)

  const totalDistanceMeters = useCallback(() => {
    if (points.length < 2) return 0
    
    let total = 0
    for (let i = 0; i < points.length - 1; i++) {
      const from = turf.point([points[i][0], points[i][1]])
      const to = turf.point([points[i + 1][0], points[i + 1][1]])
      total += turf.distance(from, to, { units: 'meters' })
    }
    return total
  }, [points])

  const addPoint = useCallback((lng, lat) => {
    setPoints(prev => [...prev, [lng, lat]])
  }, [])

  const clearPoints = useCallback(() => {
    setPoints([])
  }, [])

  const toggleActive = useCallback(() => {
    setIsActive(prev => !prev)
  }, [])

  const deactivate = useCallback(() => {
    setIsActive(false)
  }, [])

  const totalDistanceFormatted = useCallback(() => {
    const meters = totalDistanceMeters()
    if (meters === 0) return '0 yd'
    return formatDistance(meters)
  }, [totalDistanceMeters])

  return {
    points,
    totalDistanceMeters: totalDistanceMeters(),
    totalDistanceFormatted: totalDistanceFormatted(),
    isActive,
    addPoint,
    clearPoints,
    toggleActive,
    deactivate,
  }
}
