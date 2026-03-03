import React from 'react'

const LAYER_CONFIG = [
  { key: 'terrain', label: 'Terrain (Hillshade)', color: '#8B7355' },
  { key: 'huntUnits', label: 'Hunt Units', color: '#d32f2f' },
  { key: 'roads', label: 'Roads & Trails', color: '#555' },
  { key: 'landOwnership', label: 'Land Ownership', color: '#4caf50' },
  { key: 'water', label: 'Water Features', color: '#2196f3' },
  { key: 'places', label: 'Trailheads / POIs', color: '#1565c0' },
]

const ROAD_ACCESS_ITEMS = [
  { color: '#2e7d32', label: 'USFS' },
  { color: '#f9a825', label: 'BLM' },
  { color: '#558b2f', label: 'NPS' },
  { color: '#00897b', label: 'FWS' },
  { color: '#1565c0', label: 'BOR' },
  { color: '#7b1fa2', label: 'State Trust' },
  { color: '#ff9800', label: 'Tribal' },
  { color: '#e65100', label: 'Private/Unknown' },
  { color: '#c62828', label: 'Military' },
]

const LAND_OWNERSHIP_ITEMS = [
  { color: '#4caf50', label: 'USFS' },
  { color: '#ffc107', label: 'BLM' },
  { color: '#8bc34a', label: 'NPS' },
  { color: '#00bcd4', label: 'FWS' },
  { color: '#2196f3', label: 'BOR' },
  { color: '#9c27b0', label: 'State Trust' },
  { color: '#ff9800', label: 'Tribal' },
]

export default function LayerPanel({ layers, setLayers, opacity, setOpacity, collapsed, onToggleCollapse }) {
  return (
    <div className={`layer-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        {!collapsed && <h3>Layers</h3>}
        <button className="collapse-btn" onClick={onToggleCollapse}>
          {collapsed ? '◈' : '◀'}
        </button>
      </div>

      {!collapsed && (
        <>
          {LAYER_CONFIG.map(({ key, label, color }) => (
            <div key={key} className="layer-item">
              <label className="layer-toggle">
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={() => setLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                />
                <span className="color-swatch" style={{ backgroundColor: color }} />
                {label}
              </label>
              <div className="opacity-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity[key]}
                  onChange={(e) => setOpacity(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                />
                <span className="opacity-value">{opacity[key]}%</span>
              </div>
            </div>
          ))}

          <div className="legend">
            <h4>Road Access</h4>
            {ROAD_ACCESS_ITEMS.map(({ color, label }) => (
              <div key={label}>
                <span className="swatch" style={{ background: color }} /> {label}
              </div>
            ))}
          </div>

          <div className="legend">
            <h4>Land Ownership</h4>
            {LAND_OWNERSHIP_ITEMS.map(({ color, label }) => (
              <div key={label}>
                <span className="swatch" style={{ background: color }} /> {label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
