---
"id": "ah-4a8b"
"status": "open"
"deps": []
"links": []
"created": "2026-02-22T23:46:48Z"
"type": "task"
"priority": 1
"assignee": "Connor"
"tags":
- "sprint:terrain"
"external": {}
---
# Add terrain hillshade and contour lines

## Notes

**2026-02-23T00:05:20Z**

Implemented terrain via maplibre-contour with Mapterhorn CDN. Hillshade and contours share tile cache. Contour intervals: 200ft (z11-12), 100ft (z13-14), 50ft (z15+). Added terrain toggle to LayerPanel.
