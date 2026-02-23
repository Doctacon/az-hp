---
id: 20260223004448-blm-sma-geometry-conversion-f830684c
title: blm-sma-geometry-conversion
scopes:
- kind: file
  raw: pipeline/01_download.py
  path: pipeline/01_download.py
- kind: command
  raw: "BLM SMA API returns ArcGIS JSON format with 'rings' instead of GeoJSON 'coordinates'. Added convert_arcgis_to_geojson()\
    \ function to convert rings → Polygon/MultiPolygon, paths → LineString/MultiLineString. Also: BLM\
    \ (layer 21) and STATE (layer 28) FEATURES layers need 2x2 tiled bboxes - full AZ bbox returns 500\
    \ errors."
  pattern: "BLM SMA API returns ArcGIS JSON format with 'rings' instead of GeoJSON 'coordinates'. Added\
    \ convert_arcgis_to_geojson() function to convert rings → Polygon/MultiPolygon, paths → LineString/MultiLineString.\
    \ Also: BLM (layer 21) and STATE (layer 28) FEATURES layers need 2x2 tiled bboxes - full AZ bbox returns\
    \ 500 errors."
visibility: shared
status: active
created_at: "2026-02-23T00:44:48Z"
updated_at: "2026-02-23T00:44:48Z"
---

