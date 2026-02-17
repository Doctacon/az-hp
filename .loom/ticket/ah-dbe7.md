---
"id": "ah-dbe7"
"status": "open"
"deps":
- "ah-6781"
"links": []
"created": "2026-02-17T18:57:31Z"
"type": "task"
"priority": 1
"assignee": "Connor"
"parent": "ah-1494"
"tags":
- "sprint:fix-make-all"
"external": {}
---
# Run make all successfully (final verification)

# Run make all successfully (final verification)

## Objective Alignment
This is the final verification that the sprint objective is met: \`make all\` runs without errors.

## Problem
Currently \`make all\` fails at various points in the pipeline.

## Scope
- Run \`make all\` end-to-end
- Verify all expected outputs exist
- Clean up and re-run to ensure reproducibility

## Non-goals
- Performance optimization
- Adding new features

## Dependencies
- All other sprint tickets must be complete:
  - Clip step handles empty/missing files
  - Places data is downloaded
  - BLM SMA is readable
  - Enrich step runs successfully

## Implementation Plan

1. Clean all generated data:
\`\`\`bash
make clean
\`\`\`

2. Run full pipeline:
\`\`\`bash
make all
\`\`\`

3. Verify all outputs exist

## Acceptance Criteria
- [ ] \`make all\` exits with code 0
- [ ] \`data/processed/roads_enriched.parquet\` exists
- [ ] \`data/tiles/*.pmtiles\` files exist (at least roads.pmtiles)
- [ ] \`frontend/public/data/*.geojson\` files exist (GMUs, SMA)
- [ ] \`frontend/dist/\` exists with built frontend

## Verification Commands
\`\`\`bash
# Clean and run
make clean
make all
echo "Exit code: $?"

# Verify outputs
ls -la data/processed/
ls -la data/tiles/
ls -la frontend/public/data/
ls -la frontend/dist/

# Quick sanity check on roads
uv run python -c "
import geopandas as gpd
roads = gpd.read_parquet('data/processed/roads_enriched.parquet')
print(f'Roads: {len(roads)} features')
print(f'Land status breakdown:')
for status, count in roads.land_status.value_counts().items():
    print(f'  {status}: {count}')
"
\`\`\`

## Risks/Edge Cases
- Tiles generation may fail if tippecanoe not installed
- Frontend build may fail if npm packages not installed
- Large datasets may cause memory issues

## Acceptance Criteria

make all exits with code 0 and produces all expected outputs
