import React from 'react'

export default function UnitInfoPanel({ unit, onClose }) {
  const gmuName = unit.GMUNAME || 'Unknown'
  const regName = unit.REG_NAME || '—'
  const acres = unit.ACRES ? Number(unit.ACRES).toLocaleString() : '—'
  const agfdLink = unit.AGFDLink || `https://www.azgfd.com/hunting/units/${gmuName}/`

  return (
    <div className="unit-info-panel">
      <button className="close-btn" onClick={onClose}>×</button>
      <h2>Unit {gmuName}</h2>
      <p className="unit-name">{regName} Region</p>

      <div className="info-section">
        <h4>Quick Facts</h4>
        <p>Region: {regName}</p>
        <p>Acreage: {acres}</p>
      </div>

      <div className="info-section">
        <h4>Access Notes</h4>
        <p>
          Zoom in to see road color coding. Green roads cross
          USFS land, yellow cross BLM, orange indicates private
          or unknown ownership — verify access before using.
        </p>
      </div>

      <div className="info-section">
        <h4>External Links</h4>
        <a
          href={agfdLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          AZGFD Unit Page →
        </a>
      </div>
    </div>
  )
}
