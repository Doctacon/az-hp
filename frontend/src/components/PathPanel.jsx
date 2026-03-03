import React, { useState } from 'react'
import { formatMiles } from '../utils/distance'

function exportPathAsGeoJSON(path) {
  const featureCollection = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        name: path.name,
        distance_miles: path.distance,
      },
      geometry: {
        type: 'LineString',
        coordinates: path.coordinates,
      },
    }],
  }
  
  const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${path.name.replace(/[^a-z0-9]/gi, '_')}.geojson`
  a.click()
  URL.revokeObjectURL(url)
}

export default function PathPanel({
  paths,
  currentPathDistance,
  isDrawing,
  onStartDrawing,
  onFinishPath,
  onCancelDrawing,
  onDeletePath,
  onRenamePath,
  onClearAllPaths,
  collapsed,
  onToggleCollapse,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleStartEdit = (path) => {
    setEditingId(path.id)
    setEditName(path.name)
  }

  const handleSaveEdit = (id) => {
    if (editName.trim()) {
      onRenamePath(id, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id)
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditName('')
    }
  }

  return (
    <div className={`path-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        {!collapsed && <h3>Paths ({paths.length})</h3>}
        <button className="collapse-btn" onClick={onToggleCollapse}>
          {collapsed ? '📐' : '◀'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="draw-controls">
            {isDrawing ? (
              <>
                <div className="drawing-status">
                  Drawing... {currentPathDistance > 0 && `(${formatMiles(currentPathDistance)})`}
                </div>
                <div className="drawing-actions">
                  <button
                    className="finish-btn"
                    onClick={onFinishPath}
                    disabled={currentPathDistance === 0}
                  >
                    Finish
                  </button>
                  <button className="cancel-draw-btn" onClick={onCancelDrawing}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button className="draw-btn" onClick={onStartDrawing}>
                Draw Path
              </button>
            )}
          </div>

          {paths.length === 0 ? (
            <p className="empty-msg">Click "Draw Path" then click on the map to create a path</p>
          ) : (
            <ul className="path-list">
              {paths.map(path => (
                <li key={path.id} className="path-item">
                  <div
                    className="path-color-swatch"
                    style={{ backgroundColor: path.color }}
                  />
                  <div className="path-info">
                    {editingId === path.id ? (
                      <input
                        type="text"
                        className="path-name-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleSaveEdit(path.id)}
                        onKeyDown={(e) => handleKeyDown(e, path.id)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="path-name"
                        onClick={() => handleStartEdit(path)}
                        title="Click to rename"
                      >
                        {path.name}
                      </span>
                    )}
                    <span className="path-distance">{formatMiles(path.distance)}</span>
                  </div>
                  <div className="path-actions">
                    <button
                      className="export-btn"
                      onClick={() => exportPathAsGeoJSON(path)}
                      title="Export as GeoJSON"
                    >
                      ⬇
                    </button>
                    <button
                      className="delete-path-btn"
                      onClick={() => onDeletePath(path.id)}
                      title="Delete path"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {paths.length > 0 && (
            <button
              className="clear-all-btn"
              onClick={() => {
                if (window.confirm('Delete all paths? This cannot be undone.')) {
                  onClearAllPaths()
                }
              }}
            >
              Clear All
            </button>
          )}
        </>
      )}
    </div>
  )
}
