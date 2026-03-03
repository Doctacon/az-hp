---
"id": "ah-b6ec"
"status": "closed"
"deps": []
"links": []
"created": "2026-02-24T14:15:18Z"
"type": "enhancement"
"priority": 2
"assignee": "Connor"
"parent": "ah-69e9"
"tags":
- "fanout"
- "sprint:ux-improvements"
"external": {}
---
# Layer transparency sliders

Add opacity slider (0-100%) for each layer toggle in LayerPanel. Users should be able to adjust transparency of land ownership, roads, hunt units, and other layers independently.

## Design

1. Extend visibility state in App.jsx to include opacity values per layer (default: land ownership 25%, roads 80%, etc.)
2. Add range input slider below each layer checkbox in LayerPanel.jsx
3. Update useMapLayers hook to apply fill-opacity/line-opacity based on slider value
4. Pass opacity state through props or context

## Acceptance Criteria

Each layer has slider control (0-100%). Sliders update map opacity in real-time. Default values match current hardcoded opacities. Labels show current percentage.
