import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'az-hp-waypoints'

export const WAYPOINT_ICONS = [
  { id: 'camp', label: 'Camp', symbol: '⛺' },
  { id: 'glass', label: 'Glassing Point', symbol: '👁' },
  { id: 'water', label: 'Water', symbol: '💧' },
  { id: 'trailhead', label: 'Trailhead', symbol: '🚶' },
  { id: 'kill', label: 'Kill Site', symbol: '🎯' },
  { id: 'vehicle', label: 'Vehicle', symbol: '🚗' },
  { id: 'parking', label: 'Parking', symbol: '🅿️' },
  { id: 'marker', label: 'Marker', symbol: '📍' },
]

export const WAYPOINT_COLORS = [
  '#d32f2f', '#c62828', '#ad1457', '#6a1b9a',
  '#4527a0', '#283593', '#1565c0', '#0277bd',
  '#00838f', '#00695c', '#2e7d32', '#558b2f',
  '#9e9d24', '#f9a825', '#ff8f00', '#ef6c00',
]

function generateId() {
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadWaypoints() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveWaypoints(waypoints) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(waypoints))
  } catch (e) {
    console.warn('Failed to save waypoints to localStorage:', e)
  }
}

export function useWaypoints() {
  const [waypoints, setWaypoints] = useState(loadWaypoints)

  useEffect(() => {
    saveWaypoints(waypoints)
  }, [waypoints])

  const addWaypoint = useCallback((waypoint) => {
    const newWaypoint = {
      id: generateId(),
      name: waypoint.name || 'New Waypoint',
      notes: waypoint.notes || '',
      icon: waypoint.icon || 'marker',
      color: waypoint.color || '#d32f2f',
      lng: waypoint.lng,
      lat: waypoint.lat,
      createdAt: new Date().toISOString(),
    }
    setWaypoints(prev => [...prev, newWaypoint])
    return newWaypoint
  }, [])

  const updateWaypoint = useCallback((id, updates) => {
    setWaypoints(prev => prev.map(wp => 
      wp.id === id ? { ...wp, ...updates } : wp
    ))
  }, [])

  const deleteWaypoint = useCallback((id) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
  }, [])

  const clearAllWaypoints = useCallback(() => {
    setWaypoints([])
  }, [])

  return {
    waypoints,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    clearAllWaypoints,
  }
}
