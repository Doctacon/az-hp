---
"id": "ah-58db"
"status": "open"
"deps": []
"links":
- "ah-5767"
"created": "2026-02-17T18:15:32Z"
"type": "bug"
"priority": 2
"assignee": "Connor"
"tags":
- "sprint:build-pipeline"
"external": {}
---
# Fix land ownership GeoJSON format

# Fix land ownership GeoJSON format

## Problem
The file `data/raw/blm_sma_az.geojson` is in ArcGIS JSON format (uses `rings` instead of `coordinates`), not standard GeoJSON. This causes the land ownership layer to fail rendering in MapLibre.

## Root Cause
ArcGIS exports use a different JSON structure with `rings` arrays instead of the standard GeoJSON `coordinates` arrays.

## Solution
Convert the ArcGIS JSON to standard GeoJSON format. This can be done with:

```python
import json

def arcs_to_geojson(arcs_json):
    features = []
    for feat in arcs_json['features']:
        geom = feat['geometry']
        if 'rings' in geom:
            # Convert rings to Polygon coordinates
            new_geom = {
                'type': 'Polygon',
                'coordinates': geom['rings']
            }
            feat['geometry'] = new_geom
        features.append(feat)
    return {'type': 'FeatureCollection', 'features': features}
```

Or use geopandas:
```python
import geopandas as gpd
gdf = gpd.read_file('data/raw/blm_sma_az.geojson')
gdf.to_file('data/raw/blm_sma_az_fixed.geojson', driver='GeoJSON')
```

## Acceptance Criteria
- [ ] blm_sma_az.geojson is valid GeoJSON (has 'coordinates' not 'rings')
- [ ] Land ownership layer renders correctly in frontend
- [ ] Properties ADMIN_AGENCY_CODE is preserved for color matching

## Dependencies
- Discovered during ah-d2e1 (Test frontend with real data)
