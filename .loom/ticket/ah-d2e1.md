---
"id": "ah-d2e1"
"status": "open"
"deps":
- "ah-6cab"
"links": []
"created": "2026-02-17T17:16:28Z"
"type": "task"
"priority": 2
"assignee": "Connor"
"parent": "ah-1557"
"tags":
- "sprint:build-pipeline"
"external": {}
---
# Test frontend with real data

# Test frontend with real data

## Objective Alignment

This is the final verification step. The frontend code is already complete but has never been tested with real data. We need to confirm the map renders correctly with the generated tiles and GeoJSON files.

## Scope

- Install frontend dependencies (`npm install`)
- Start dev server (`make dev-frontend`)
- Verify map loads at http://localhost:5173
- Test layer visibility toggles
- Test click interactions (hunt unit info, road popups)
- Document any issues found

## Non-Goals

- Do not fix frontend bugs (create follow-up tickets instead)
- Do not deploy or build for production

## Implementation Plan

1. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

2. Ensure data files exist:
   ```bash
   ls frontend/public/data/
   # Should show: azgfd_gmu.geojson, blm_sma_az.geojson, roads.pmtiles, places.pmtiles, water.pmtiles
   ```

3. Start dev server:
   ```bash
   make dev-frontend
   ```

4. Open browser to http://localhost:5173

5. Test the following:
   - [ ] Map loads centered on Arizona
   - [ ] Hunt unit boundaries render (red dashed lines)
   - [ ] Land ownership layer renders (colored fills)
   - [ ] Roads layer renders (colored by land status)
   - [ ] Water layer renders (blue fills)
   - [ ] Places layer renders (blue circles)
   - [ ] Layer toggle panel works
   - [ ] Click on hunt unit shows info panel
   - [ ] Click on road shows popup with details

6. Document any console errors or rendering issues

## Acceptance Criteria

- [ ] Dev server starts without errors
- [ ] Map loads at http://localhost:5173
- [ ] Hunt units layer renders correctly
- [ ] Land ownership layer renders correctly
- [ ] Roads layer renders correctly
- [ ] Click on hunt unit displays info panel with GMUNAME
- [ ] No fatal JavaScript errors in browser console

## Verification Commands

```bash
cd frontend && npm install
make dev-frontend
# Open http://localhost:5173 in browser
# Check browser console for errors (F12 -> Console)
```

## Risks / Edge Cases

- **PMTiles protocol not registered** — check browser console for "pmtiles" errors
- **CORS issues** — dev server should handle this, but check console
- **Missing data files** — verify all expected files exist
- **Large PMTiles slow to load** — first load may be slow

## Dependencies

- Requires ah-6cab (Generate PMTiles) to be complete
- Cannot start until tiles are generated

## Acceptance Criteria

Frontend dev server starts; map loads at localhost:5173; at least 3 layers render correctly (hunt units, land ownership, roads)
