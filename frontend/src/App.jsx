import React, { useRef, useState, useCallback } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMap, useMapSources, useMapLayers, useMapInteractions, useWaypoints, useWaypointMarkers, useWaypointMapClick } from './hooks'
import { DEFAULT_VISIBILITY } from './config/layers'
import LayerPanel from './components/LayerPanel'
import UnitInfoPanel from './components/UnitInfoPanel'
import WaypointDialog from './components/WaypointDialog'
import WaypointPanel from './components/WaypointPanel'
import './App.css'

export default function App() {
  const mapContainerRef = useRef(null)
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY)

  const { map, isLoaded } = useMap(mapContainerRef)
  useMapSources(map, isLoaded)
  useMapLayers(map, isLoaded, visibility)
  const { selectedUnit, setSelectedUnit } = useMapInteractions(map, isLoaded)

  const {
    waypoints,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    clearAllWaypoints,
  } = useWaypoints()

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    waypoint: null,
    lngLat: null,
  })
  const [waypointPanelCollapsed, setWaypointPanelCollapsed] = useState(false)

  const handleWaypointClick = useCallback((wp) => {
    setDialogState({
      isOpen: true,
      waypoint: wp,
      lngLat: null,
    })
  }, [])

  const handleWaypointDrag = useCallback((id, lng, lat) => {
    updateWaypoint(id, { lng, lat })
  }, [updateWaypoint])

  const handleMapDblClick = useCallback((lngLat) => {
    setDialogState({
      isOpen: true,
      waypoint: null,
      lngLat,
    })
  }, [])

  const handleSaveWaypoint = (data) => {
    if (dialogState.waypoint) {
      updateWaypoint(dialogState.waypoint.id, data)
    } else {
      addWaypoint(data)
    }
    setDialogState({ isOpen: false, waypoint: null, lngLat: null })
  }

  const handleDeleteWaypoint = (id) => {
    deleteWaypoint(id)
    setDialogState({ isOpen: false, waypoint: null, lngLat: null })
  }

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, waypoint: null, lngLat: null })
  }

  const handleSelectWaypoint = (wp) => {
    if (map) {
      map.flyTo({
        center: [wp.lng, wp.lat],
        zoom: Math.max(map.getZoom(), 14),
      })
    }
  }

  useWaypointMarkers(map, isLoaded, waypoints, handleWaypointClick, handleWaypointDrag)
  useWaypointMapClick(map, isLoaded, handleMapDblClick)

  return (
    <div className="app">
      <div ref={mapContainerRef} className="map-container" />
      <LayerPanel layers={visibility} setLayers={setVisibility} />
      <WaypointPanel
        waypoints={waypoints}
        onSelect={handleSelectWaypoint}
        onDelete={deleteWaypoint}
        onClearAll={clearAllWaypoints}
        collapsed={waypointPanelCollapsed}
        onToggleCollapse={() => setWaypointPanelCollapsed(!waypointPanelCollapsed)}
      />
      {selectedUnit && (
        <UnitInfoPanel
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
        />
      )}
      {dialogState.isOpen && (
        <WaypointDialog
          key={dialogState.waypoint?.id || 'new'}
          waypoint={dialogState.waypoint}
          lngLat={dialogState.lngLat}
          onSave={handleSaveWaypoint}
          onDelete={dialogState.waypoint ? handleDeleteWaypoint : null}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  )
}
