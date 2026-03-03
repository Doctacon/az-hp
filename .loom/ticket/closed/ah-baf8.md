---
"id": "ah-baf8"
"status": "closed"
"deps": []
"links": []
"created": "2026-02-24T14:16:04Z"
"type": "feature"
"priority": 2
"assignee": "Connor"
"parent": "ah-69e9"
"tags":
- "fanout"
- "sprint:drawing-tools"
"external": {}
---
# Distance measurement tool

Click-to-measure mode showing cumulative distance between clicked points. User activates measure mode, clicks multiple points on map, sees running total of distance in feet/miles.

## Design

1. Add Measure button to UI (toolbar or LayerPanel)
2. Create useMeasurement hook with:
   - points array (clicked coordinates)
   - totalDistance (in feet/miles)
   - addPoint(), clearPoints(), isActive toggle
3. Add map click handler when measure mode active (useMeasurementMapClick)
4. Render temporary line + markers on map using MapLibre sources/layers
5. Display distance in floating tooltip or panel
6. Support Esc key to exit measure mode

## Acceptance Criteria

Measure button toggles measure mode (visual indicator when active). Clicking map adds point and shows cumulative distance. Distance shown in miles (with feet for < 1 mile). Clear button resets measurement. Esc key exits measure mode. Visual line connects measured points.
