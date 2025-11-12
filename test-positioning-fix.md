# Patient Report & DILI Diagnostic Positioning Fix

## Problem
Patient Report and DILI Diagnostic components were overlapping when rendered on the board because:
1. Both had default width of 1600px (wide items)
2. The positioning logic used column-based layout designed for 520px items
3. Wide items were placed in the same column, causing horizontal overlap

## Solution
Updated `findPositionInZone()` function in `api/server-redis.js` to:

### 1. Detect Wide Items
- Items with width >= 1000px are now treated as "wide items"
- Wide items use vertical stacking instead of column-based layout

### 2. Vertical Stacking for Wide Items
- Wide items are placed at the left edge of the zone (startX)
- Each new wide item is positioned below existing items
- Overlap detection ensures no collisions with existing items

### 3. Column Layout for Normal Items
- Items < 1000px wide continue to use the column-based layout
- Wide items are skipped when calculating column heights
- This prevents normal items from being affected by wide items

## Testing

### Test 1: Generate DILI Diagnostic
```bash
curl -X POST http://localhost:3001/api/dili-diagnostic \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": {
      "classification": "Hepatocellular",
      "R_ratio": 12.5,
      "keyLabs": [{"label": "ALT", "value": "850 U/L", "note": "↑↑"}],
      "clinicalFeatures": ["Acute jaundice"]
    },
    "causality": {
      "primaryDrug": "Test Drug",
      "contributingFactors": ["Age > 60"],
      "mechanisticRationale": ["Idiosyncratic"]
    },
    "severity": {
      "features": ["Hy'\''s Law met"],
      "prognosis": "Moderate"
    },
    "management": {
      "immediateActions": ["Discontinue drug"],
      "consults": ["Hepatology"],
      "monitoringPlan": ["Weekly LFTs"]
    }
  }'
```

### Test 2: Generate Patient Report
```bash
curl -X POST http://localhost:3001/api/patient-report \
  -H "Content-Type: application/json" \
  -d '{
    "patientData": {
      "name": "Test Patient",
      "mrn": "TEST-001",
      "age": 65,
      "sex": "Female",
      "primaryDiagnosis": "Test Diagnosis",
      "management_recommendations": ["Monitor closely"]
    }
  }'
```

### Expected Result
- DILI Diagnostic should appear at the top of the zone
- Patient Report should appear below DILI Diagnostic (no overlap)
- Both items should be at the left edge of their respective zones
- Vertical spacing of 60px between items

## Files Modified
- `api/server-redis.js` - Updated `findPositionInZone()` function

## Benefits
1. ✅ No more overlapping between wide components
2. ✅ Automatic vertical stacking for large reports
3. ✅ Maintains column layout for normal-sized items
4. ✅ Works with any zone configuration
5. ✅ Handles mixed item sizes gracefully
