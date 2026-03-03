---
"id": "ah-2cfe"
"status": "closed"
"deps": []
"links": []
"created": "2026-02-24T14:15:18Z"
"type": "enhancement"
"priority": 3
"assignee": "Connor"
"parent": "ah-69e9"
"tags":
- "fanout"
- "sprint:ux-improvements"
"external": {}
---
# Scale bar control

Add MapLibre ScaleControl to bottom-left corner. Shows current map scale in imperial units (miles/feet), updates dynamically on zoom.

## Design

In useMap hook (frontend/src/hooks/useMap.js), add scale control after map initialization:
map.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-left')

## Acceptance Criteria

Scale bar visible in bottom-left corner. Updates dynamically on zoom. Shows miles/feet (imperial units).
