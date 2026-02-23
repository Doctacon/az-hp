import React, { useState } from 'react'
import { WAYPOINT_ICONS, WAYPOINT_COLORS } from '../hooks/useWaypoints'

export default function WaypointDialog({ 
  waypoint, 
  lngLat, 
  onSave, 
  onDelete,
  onClose 
}) {
  const [name, setName] = useState(waypoint?.name || '')
  const [notes, setNotes] = useState(waypoint?.notes || '')
  const [icon, setIcon] = useState(waypoint?.icon || 'marker')
  const [color, setColor] = useState(waypoint?.color || '#d32f2f')

  const isEditing = !!waypoint
  const displayCoords = waypoint 
    ? { lng: waypoint.lng, lat: waypoint.lat }
    : lngLat

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSave({
      ...(waypoint || {}),
      name: name.trim(),
      notes: notes.trim(),
      icon,
      color,
      lng: displayCoords.lng,
      lat: displayCoords.lat,
    })
  }

  const copyCoords = () => {
    const text = `${displayCoords.lat.toFixed(5)}, ${displayCoords.lng.toFixed(5)}`
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="waypoint-dialog-overlay" onClick={onClose}>
      <div className="waypoint-dialog" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h3>{isEditing ? 'Edit Waypoint' : 'New Waypoint'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter waypoint name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-grid">
              {WAYPOINT_ICONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`icon-btn ${icon === opt.id ? 'selected' : ''}`}
                  onClick={() => setIcon(opt.id)}
                  title={opt.label}
                >
                  {opt.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-grid">
              {WAYPOINT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-btn ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>
              Coordinates
              <button type="button" className="copy-btn" onClick={copyCoords}>
                Copy
              </button>
            </label>
            <div className="coords-display">
              {displayCoords.lat.toFixed(5)}, {displayCoords.lng.toFixed(5)}
            </div>
          </div>

          <div className="dialog-actions">
            {isEditing && onDelete && (
              <button 
                type="button" 
                className="delete-btn"
                onClick={() => onDelete(waypoint.id)}
              >
                Delete
              </button>
            )}
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={!name.trim()}>
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
