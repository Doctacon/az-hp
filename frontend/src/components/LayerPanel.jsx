import React from 'react'

const LAYER_CONFIG = [
  { key: 'huntUnits', label: 'Hunt Units', color: '#d32f2f' },
  { key: 'roads', label: 'Roads & Trails', color: '#555' },
  { key: 'landOwnership', label: 'Land Ownership', color: '#4caf50' },
  { key: 'water', label: 'Water', color: '#a4cce4' },
  { key: 'landCover', label: 'Land Cover', color: '#2d5a27' },
  { key: 'buildings', label: 'Buildings', color: '#bbb' },
  { key: 'places', label: 'Trailheads / POIs', color: '#1565c0' },
]

export default function LayerPanel({ layers, setLayers }) {
  return (
    <div className="layer-panel">
      <h3>Layers</h3>
      {LAYER_CONFIG.map(({ key, label, color }) => (
        <label key={key} className="layer-toggle">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => setLayers(prev => ({ ...prev, [key]: !prev[key] }))}
          />
          <span className="color-swatch" style={{ backgroundColor: color }} />
          {label}
        </label>
      ))}

      <div className="legend">
        <h4>Road Access</h4>
        <div><span className="swatch" style={{ background: '#2e7d32' }} /> USFS</div>
        <div><span className="swatch" style={{ background: '#f9a825' }} /> BLM</div>
        <div><span className="swatch" style={{ background: '#558b2f' }} /> NPS</div>
        <div><span className="swatch" style={{ background: '#00897b' }} /> FWS</div>
        <div><span className="swatch" style={{ background: '#7b1fa2' }} /> State Trust</div>
        <div><span className="swatch" style={{ background: '#e65100' }} /> Private/Unknown</div>
        <div><span className="swatch" style={{ background: '#c62828' }} /> Military</div>
      </div>

      <div className="legend">
        <h4>Land Ownership</h4>
        <div><span className="swatch" style={{ background: '#4caf50' }} /> USFS</div>
        <div><span className="swatch" style={{ background: '#ffc107' }} /> BLM</div>
        <div><span className="swatch" style={{ background: '#8bc34a' }} /> NPS</div>
        <div><span className="swatch" style={{ background: '#00bcd4' }} /> FWS</div>
        <div><span className="swatch" style={{ background: '#9c27b0' }} /> State Trust</div>
      </div>
    </div>
  )
}
