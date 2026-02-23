import React, { useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMap } from './hooks/useMap'
import { useMapSources } from './hooks/useMapSources'
import { useMapLayers } from './hooks/useMapLayers'
import { useMapInteractions } from './hooks/useMapInteractions'
import { DEFAULT_VISIBILITY } from './config/layers'
import LayerPanel from './components/LayerPanel'
import UnitInfoPanel from './components/UnitInfoPanel'
import './App.css'

export default function App() {
  const mapContainerRef = useRef(null)
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY)

  const { map, isLoaded } = useMap(mapContainerRef)
  useMapSources(map, isLoaded)
  useMapLayers(map, isLoaded, visibility)
  const { selectedUnit, setSelectedUnit } = useMapInteractions(map, isLoaded)

  return (
    <div className="app">
      <div ref={mapContainerRef} className="map-container" />
      <LayerPanel layers={visibility} setLayers={setVisibility} />
      {selectedUnit && (
        <UnitInfoPanel
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </div>
  )
}
