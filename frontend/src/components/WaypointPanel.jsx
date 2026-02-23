import React from 'react'
import { WAYPOINT_ICONS } from '../hooks/useWaypoints'

export default function WaypointPanel({ 
  waypoints, 
  onSelect, 
  onDelete, 
  onClearAll,
  collapsed,
  onToggleCollapse 
}) {
  const getIconSymbol = (iconId) => {
    return WAYPOINT_ICONS.find(i => i.id === iconId)?.symbol || '📍'
  }

  return (
    <div className={`waypoint-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        {!collapsed && <h3>Waypoints ({waypoints.length})</h3>}
        <button className="collapse-btn" onClick={onToggleCollapse}>
          {collapsed ? '📍' : '◀'}
        </button>
      </div>

      {!collapsed && (
        <>
          {waypoints.length === 0 ? (
            <p className="empty-msg">Double-click on the map to add waypoints</p>
          ) : (
            <ul className="waypoint-list">
              {waypoints.map(wp => (
                <li 
                  key={wp.id} 
                  className="waypoint-item"
                  onClick={() => onSelect(wp)}
                >
                  <span 
                    className="waypoint-icon" 
                    style={{ backgroundColor: wp.color }}
                  >
                    {getIconSymbol(wp.icon)}
                  </span>
                  <div className="waypoint-info">
                    <span className="waypoint-name">{wp.name}</span>
                    {wp.notes && (
                      <span className="waypoint-notes">{wp.notes}</span>
                    )}
                  </div>
                  <button
                    className="delete-waypoint-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(wp.id)
                    }}
                    title="Delete waypoint"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {waypoints.length > 0 && (
            <button className="clear-all-btn" onClick={onClearAll}>
              Clear All
            </button>
          )}
        </>
      )}
    </div>
  )
}
