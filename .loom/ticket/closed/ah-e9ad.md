---
"id": "ah-e9ad"
"status": "closed"
"deps":
- "ah-7c72"
"links": []
"created": "2026-02-19T22:39:39Z"
"type": "task"
"priority": 3
"assignee": "Connor"
"parent": "ah-c3c2"
"tags":
- "sprint:map-perf-architecture"
"external": {}
---
# Refactor map architecture

## Problem
`App.jsx` is a 313-line monolith containing all map logic: initialization, sources, layers, interactions, and visibility management. This makes it hard to maintain and extend.

## Scope
- Break App.jsx into focused hooks
- Extract layer and source definitions into config files
- Use `setFeatureState` for selection/hover instead of query-based approach

## Non-goals
- Redux/state management library
- TypeScript migration
- Component library changes

## Implementation Plan

1. **Create `frontend/src/config/sources.js`**:
   ```js
   export const SOURCES = {
     basemap: {
       type: 'vector',
       url: 'pmtiles:///data/basemap.pmtiles',
     },
     'hunt-units': {
       type: 'vector',
       url: 'pmtiles:///data/hunt-units.pmtiles',
     },
     'land-ownership': {
       type: 'vector',
       url: 'pmtiles:///data/land-ownership.pmtiles',
     },
     'roads': {
       type: 'vector',
       url: 'pmtiles:///data/roads.pmtiles',
     },
     'places': {
       type: 'vector',
       url: 'pmtiles:///data/places.pmtiles',
     },
   };
   ```

2. **Create `frontend/src/config/layers.js`**:
   ```js
   export const LAYERS = [
     {
       id: 'land-ownership-fill',
       type: 'fill',
       source: 'land-ownership',
       sourceLayer: 'land-ownership',
       minzoom: 8,
       paint: {
         'fill-color': [...],
         'fill-opacity': 0.6,
         'fill-antialias': false,
       },
     },
     // ... more layers
   ];
   ```

3. **Create `frontend/src/hooks/useMap.js`**:
   ```js
   export function useMap(containerRef) {
     const [map, setMap] = useState(null);
     
     useEffect(() => {
       maplibregl.prewarm();
       const mapInstance = new maplibregl.Map({
         container: containerRef.current,
         // ... config
       });
       setMap(mapInstance);
       return () => mapInstance.remove();
     }, []);
     
     return map;
   }
   ```

4. **Create `frontend/src/hooks/useMapSources.js`**:
   ```js
   export function useMapSources(map, sources) {
     useEffect(() => {
       if (!map) return;
       Object.entries(sources).forEach(([id, config]) => {
         if (!map.getSource(id)) {
           map.addSource(id, config);
         }
       });
     }, [map, sources]);
   }
   ```

5. **Create `frontend/src/hooks/useMapLayers.js`**:
   ```js
   export function useMapLayers(map, layers, visibility) {
     useEffect(() => {
       if (!map) return;
       layers.forEach(layer => {
         if (!map.getLayer(layer.id)) {
           map.addLayer(layer);
         }
         map.setLayoutProperty(
           layer.id,
           'visibility',
           visibility[layer.group] ? 'visible' : 'none'
         );
       });
     }, [map, layers, visibility]);
   }
   ```

6. **Create `frontend/src/hooks/useMapInteractions.js`**:
   ```js
   export function useMapInteractions(map) {
     const [selectedUnit, setSelectedUnit] = useState(null);
     
     useEffect(() => {
       if (!map) return;
       
       map.on('click', 'hunt-units-fill', (e) => {
         const feature = e.features[0];
         // Use setFeatureState for selection highlighting
         if (selectedUnit) {
           map.setFeatureState(
             { source: 'hunt-units', id: selectedUnit },
             { selected: false }
           );
         }
         map.setFeatureState(
           { source: 'hunt-units', id: feature.id },
           { selected: true }
         );
         setSelectedUnit(feature.id);
       });
     }, [map]);
   }
   ```

7. **Refactor `App.jsx`** to use hooks:
   ```js
   function App() {
     const containerRef = useRef();
     const map = useMap(containerRef);
     const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
     
     useMapSources(map, SOURCES);
     useMapLayers(map, LAYERS, visibility);
     useMapInteractions(map);
     
     return (
       <div ref={containerRef}>...</div>
     );
   }
   ```

## Verification Commands
```bash
make dev-frontend
# Verify map still renders correctly
# Verify layer toggles work
# Verify click interactions work
```

## Risks/Edge Cases
- Hook dependencies may cause re-renders if not careful
- Feature state requires features to have stable `id` property

## Acceptance Criteria

App.jsx broken into hooks (useMap, useMapSources, useMapLayers, useMapInteractions); layer and source definitions in config files; setFeatureState used for selection/hover

## Notes

**2026-02-20T03:22:49Z**

Completed architecture refactor:
- Created config/sources.js (source definitions)
- Created config/layers.js (layer definitions, groups, visibility defaults)
- Created config/map.js (map config)
- Created hooks/useMap.js (map initialization, prewarm, lifecycle)
- Created hooks/useMapSources.js (source registration)
- Created hooks/useMapLayers.js (layer management, basemap integration)
- Created hooks/useMapInteractions.js (click/hover handlers)
- Refactored App.jsx from 307 lines to 36 lines
- All hooks have proper cleanup
