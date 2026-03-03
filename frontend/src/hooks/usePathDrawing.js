import { useState, useCallback, useEffect } from 'react'
import * as turf from '@turf/turf'

const STORAGE_KEY = 'az-hp-paths'

export const PATH_COLORS = [
  '#1565c0', '#2e7d32', '#c62828', '#6a1b9a',
  '#ef6c00', '#00838f', '#ad1457', '#558b2f',
]

function generateId() {
  return `path-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadPaths() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function savePaths(paths) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths))
  } catch (e) {
    console.warn('Failed to save paths to localStorage:', e)
  }
}

function calculateDistance(coordinates) {
  if (coordinates.length < 2) return 0
  const line = turf.lineString(coordinates)
  return turf.length(line, { units: 'miles' })
}

export function usePathDrawing() {
  const [paths, setPaths] = useState(loadPaths)
  const [currentPath, setCurrentPath] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    savePaths(paths)
  }, [paths])

  const startDrawing = useCallback(() => {
    setIsDrawing(true)
    setCurrentPath([])
  }, [])

  const addVertex = useCallback((lng, lat) => {
    if (!isDrawing) return
    setCurrentPath(prev => [...prev, [lng, lat]])
  }, [isDrawing])

  const finishPath = useCallback(() => {
    if (currentPath.length < 2) {
      setCurrentPath([])
      setIsDrawing(false)
      return null
    }
    const newPath = {
      id: generateId(),
      name: `Path ${paths.length + 1}`,
      coordinates: [...currentPath],
      distance: calculateDistance(currentPath),
      color: PATH_COLORS[paths.length % PATH_COLORS.length],
      createdAt: new Date().toISOString(),
    }
    setPaths(prev => [...prev, newPath])
    setCurrentPath([])
    setIsDrawing(false)
    return newPath
  }, [currentPath, paths.length])

  const cancelDrawing = useCallback(() => {
    setCurrentPath([])
    setIsDrawing(false)
  }, [])

  const deletePath = useCallback((id) => {
    setPaths(prev => prev.filter(p => p.id !== id))
  }, [])

  const renamePath = useCallback((id, name) => {
    setPaths(prev => prev.map(p =>
      p.id === id ? { ...p, name } : p
    ))
  }, [])

  const clearAllPaths = useCallback(() => {
    setPaths([])
  }, [])

  const currentPathDistance = calculateDistance(currentPath)

  return {
    paths,
    currentPath,
    currentPathDistance,
    isDrawing,
    startDrawing,
    addVertex,
    finishPath,
    cancelDrawing,
    deletePath,
    renamePath,
    clearAllPaths,
  }
}
