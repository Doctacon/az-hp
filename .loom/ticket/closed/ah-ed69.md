---
"id": "ah-ed69"
"status": "closed"
"deps":
- "ah-2fa8"
- "ah-d095"
"links": []
"created": "2026-02-18T02:02:46Z"
"type": "task"
"priority": 1
"assignee": "Connor"
"parent": "ah-174b"
"tags":
- "sprint:map-display-fix"
"external": {}
---
# Verify map renders with all layers

# Verify map renders with all layers

## Objective Alignment
This is the **acceptance verification** for the sprint. The objective is to see the map in the browser.

## Scope
- Start the development frontend server
- Verify the map container renders
- Verify all layer sources load without errors
- Verify layers display correctly
- Document any browser console errors

## Non-goals
- Fix additional issues discovered (create follow-up tickets instead)
- Performance optimization
- Mobile responsiveness

## Implementation Plan

1. **Start the dev server**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

2. **Open browser** to http://localhost:5173 (or Vite's assigned port)

3. **Visual verification checklist**:
   - [ ] Map container is visible (not blank/white)
   - [ ] Background color renders (#f0ede6)
   - [ ] Hunt Units layer shows red dashed outlines
   - [ ] Roads layer shows colored lines (green/yellow/orange based on land status)
   - [ ] Water layer shows blue fills
   - [ ] Land ownership layer shows colored fills
   - [ ] Layer panel toggles work (layers show/hide)
   - [ ] Clicking hunt unit shows info panel

4. **Browser console check**:
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed resource loads
   - Document any 404s or errors

5. **Layer source verification**:
   - Check that all PMTiles sources load
   - Check that GeoJSON sources load
   - Verify no "source not found" errors

## Verification Commands
```bash
# Start dev server
make dev-frontend

# In another terminal, check data is accessible
curl -I http://localhost:5173/data/azgfd_gmu.geojson
curl -I http://localhost:5173/data/roads.pmtiles

# Check for obvious errors in build
cd frontend && npm run build
```

## Acceptance Criteria
- [ ] `make dev-frontend` starts without errors
- [ ] Map container renders (not blank)
- [ ] At least 3 layers are visible (Hunt Units, Roads, Water)
- [ ] No 404 errors in browser Network tab for data files
- [ ] Layer toggles work (clicking checkbox shows/hides layer)
- [ ] Click on hunt unit shows info panel on right side

## Risks/Edge Cases
- **CORS issues**: Vite dev server should serve static files correctly
- **Missing data**: If pipeline partially failed, some layers may be empty
- **Browser compatibility**: Test in Chrome/Firefox

## Dependencies
- Requires: ah-2fa8 (Run full data pipeline)
- Blocked by: ah-d095 (Fix ArcGIS JSON) if land ownership layer fails to render

## Acceptance Criteria

make dev-frontend shows interactive map with roads, land ownership, hunt units, and water layers visible
