---
"id": "ah-ad64"
"status": "open"
"deps": []
"links":
- "ah-a536"
"created": "2026-02-17T18:57:31Z"
"type": "bug"
"priority": 2
"assignee": "Connor"
"parent": "ah-1494"
"tags":
- "sprint:fix-make-all"
"external": {}
---
# Fix BLM SMA missing BLM and State Trust land

# Fix BLM SMA missing BLM and State Trust land

## Objective Alignment
The BLM SMA land ownership data is critical for the land_status enrichment of roads. Without BLM and State Trust land, all roads will show \`private_or_unknown\` status.

## Problem
The BLM ArcGIS API returns 500 errors for:
- Layer 7 (BLM - Bureau of Land Management)
- Layer 14 (STATE - State Trust land)

These are the two most important land types for hunting access.

## Scope
- Fix the BLM SMA download to include BLM and State Trust land
- Investigate alternative data sources if BLM API remains broken
- May supersede/adopt ticket ah-a536

## Non-goals
- Add new land types beyond what the SMA layer provides
- Build alternative land ownership pipeline from scratch

## Implementation Plan

1. **Try tiled bounding boxes**: Split Arizona into 4 quadrants and query each separately to avoid 500 errors

2. **Alternative sources** if tiled approach fails:
   - PAD-US (Protected Areas Database) from USGS
   - BLM GeoPlatform bulk downloads
   - Arizona State Land Department data

3. **Code changes in \`01_download.py\`**:
\`\`\`python
def download_blm_sma_tiled():
    # Split AZ_BBOX into 4 tiles
    tiles = [
        {"xmin": -114.82, "xmax": -111.93, "ymin": 31.33, "ymax": 34.165},
        {"xmin": -111.93, "xmax": -109.04, "ymin": 31.33, "ymax": 34.165},
        {"xmin": -114.82, "xmax": -111.93, "ymin": 34.165, "ymax": 37.00},
        {"xmin": -111.93, "xmax": -109.04, "ymin": 34.165, "ymax": 37.00},
    ]
    # Query each tile for BLM and STATE layers
\`\`\`

## Acceptance Criteria
- [ ] \`blm_sma_az.geojson\` contains features with \`ADMIN_AGENCY_CODE\` = "BLM"
- [ ] \`blm_sma_az.geojson\` contains features with \`ADMIN_AGENCY_CODE\` = "STP" (State Trust)
- [ ] Re-running enrich produces roads with correct \`land_status\` values

## Verification Commands
\`\`\`bash
uv run python -c "
import geopandas as gpd
sma = gpd.read_file('data/raw/blm_sma_az.geojson')
codes = sma.ADMIN_AGENCY_CODE.unique()
print(f'Agency codes: {codes}')
assert 'BLM' in codes or 7 in codes, 'Missing BLM land'
assert 'STP' in codes or 'STATE' in codes or 14 in codes, 'Missing State Trust land'
"
\`\`\`

## Risks/Edge Cases
- BLM API may be fundamentally broken for these layers
- May need to pivot to PAD-US if tiling doesn't work
- State Trust land boundaries may differ from BLM's representation

## Acceptance Criteria

blm_sma_az.geojson contains BLM and STP agency codes
