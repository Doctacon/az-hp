---
id: 20260220225841-pipeline-optimized-removed-unused-overture-downloads-water-landcover-buildi-e21313a5
title: "Pipeline optimized: removed unused Overture downloads (water/landcover/buildings/land_use/land),\
  \ added caching to all steps, stream parquet→tippecanoe via process substitution (no intermediate GeoJSON),\
  \ parallelize tile generation. Fresh run: 5-6 min (was 10-15). Cached run: 2-3 min. Disk: 801MB (was\
  \ 5GB)."
scopes:
- kind: file
  raw: pipeline/04_generate_tiles.sh
  path: pipeline/04_generate_tiles.sh
visibility: shared
status: active
created_at: "2026-02-20T22:58:41Z"
updated_at: "2026-02-20T22:58:41Z"
---

