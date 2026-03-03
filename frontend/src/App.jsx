import React, { useRef, useState, useCallback, useEffect } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMap, useMapSources, useMapLayers, useMapInteractions, useWaypoints, useWaypointMarkers, useWaypointMapClick, useMeasurement, useMeasurementLayers, useMeasurementClick, usePathDrawing, usePathLayers, usePathMapClick } from './hooks'
import { DEFAULT_VISIBILITY, DEFAULT_OPACITY } from './config/layers'
import LayerPanel from './components/LayerPanel'
import UnitInfoPanel from './components/UnitInfoPanel'
import WaypointDialog from './components/WaypointDialog'
import WaypointPanel from './components/WaypointPanel'
import MeasurePanel from './components/MeasurePanel'
import PathPanel from './components/PathPanel'
import './App.css'

export default function App() {
  const mapContainerRef = useRef(null)
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY)
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY)

  const { map, isLoaded } = useMap(mapContainerRef)
  useMapSources(map, isLoaded)
  useMapLayers(map, isLoaded, visibility, opacity)
  const { selectedUnit, setSelectedUnit } = useMapInteractions(map, isLoaded)

  const {
    waypoints,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    clearAllWaypoints,
  } = useWaypoints()

  const {
    points: measurePoints,
    totalDistanceFormatted,
    isActive: isMeasureActive,
    addPoint: addMeasurePoint,
    clearPoints: clearMeasurePoints,
    toggleActive: toggleMeasureActive,
    deactivate: deactivateMeasure,
  } = useMeasurement()

  const {
    paths,
    currentPath,
    currentPathDistance,
    isDrawing: isPathDrawing,
    startDrawing,
    addVertex,
    finishPath,
    cancelDrawing,
    deletePath,
    renamePath,
    clearAllPaths,
  } = usePathDrawing()

  const [pathPanelCollapsed, setPathPanelCollapsed] = useState(false)
  const [layerPanelCollapsed, setLayerPanelCollapsed] = useState(false)

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
  useMeasurementLayers(map, isLoaded, measurePoints, isMeasureActive)
  useMeasurementClick(map, isLoaded, isMeasureActive, addMeasurePoint)
  usePathLayers(map, isLoaded, paths, currentPath)
  usePathMapClick(map, isLoaded, isPathDrawing && !isMeasureActive, addVertex)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMeasureActive) {
        deactivateMeasure()
      }
      if (e.key === 'Escape' && isPathDrawing) {
        cancelDrawing()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMeasureActive, deactivateMeasure, isPathDrawing, cancelDrawing])

  return (
    <div className="app">
      <div ref={mapContainerRef} className="map-container" />
      <LayerPanel
        layers={visibility}
        setLayers={setVisibility}
        opacity={opacity}
        setOpacity={setOpacity}
        collapsed={layerPanelCollapsed}
        onToggleCollapse={() => setLayerPanelCollapsed(!layerPanelCollapsed)}
      />
      <WaypointPanel
        waypoints={waypoints}
        onSelect={handleSelectWaypoint}
        onDelete={deleteWaypoint}
        onClearAll={clearAllWaypoints}
        collapsed={waypointPanelCollapsed}
        onToggleCollapse={() => setWaypointPanelCollapsed(!waypointPanelCollapsed)}
      />
      <MeasurePanel
        isActive={isMeasureActive}
        totalDistanceFormatted={totalDistanceFormatted}
        pointCount={measurePoints.length}
        onToggle={toggleMeasureActive}
        onClear={clearMeasurePoints}
      />
      <PathPanel
        paths={paths}
        currentPathDistance={currentPathDistance}
        isDrawing={isPathDrawing}
        onStartDrawing={startDrawing}
        onFinishPath={finishPath}
        onCancelDrawing={cancelDrawing}
        onDeletePath={deletePath}
        onRenamePath={renamePath}
        onClearAllPaths={clearAllPaths}
        collapsed={pathPanelCollapsed}
        onToggleCollapse={() => setPathPanelCollapsed(!pathPanelCollapsed)}
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
