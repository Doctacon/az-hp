import React from 'react'

export default function MeasurePanel({
  isActive,
  totalDistanceFormatted,
  pointCount,
  onToggle,
  onClear,
}) {
  return (
    <div className={`measure-panel ${isActive ? 'active' : ''}`}>
      <div className="measure-header">
        <h3>Measure</h3>
        <button
          className={`measure-toggle-btn ${isActive ? 'active' : ''}`}
          onClick={onToggle}
          title={isActive ? 'Exit measure mode' : 'Start measuring'}
        >
          {isActive ? '✓' : '📏'}
        </button>
      </div>

      {isActive && (
        <div className="measure-content">
          <div className="measure-distance">
            <span className="measure-label">Distance:</span>
            <span className="measure-value">{totalDistanceFormatted}</span>
          </div>
          <div className="measure-points">
            <span className="measure-label">Points:</span>
            <span className="measure-value">{pointCount}</span>
          </div>
          {pointCount > 0 && (
            <button className="measure-clear-btn" onClick={onClear}>
              Clear
            </button>
          )}
          <p className="measure-hint">Click on map to add points</p>
        </div>
      )}
    </div>
  )
}
