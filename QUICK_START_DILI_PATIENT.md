# Quick Start: DILI Diagnostic & Patient Report

Fast reference for creating DILI Diagnostic Panels and Patient Reports on the MedForce AI board.

## 🚀 Quick Commands

### DILI Diagnostic Panel (Minimal)

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
      "primaryDrug": "Amoxicillin-Clavulanate",
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

### Patient Report (Minimal)

```bash
curl -X POST http://localhost:3001/api/patient-report \
  -H "Content-Type: application/json" \
  -d '{
    "patientData": {
      "name": "Jane Smith",
      "mrn": "MRN-789456"
    }
  }'
```

## 📍 Zone Placement

Add `"zone"` parameter to place in specific zones:

```json
{
  "zone": "task-management-zone",
  // ... rest of data
}
```

**Available Zones:**
- `task-management-zone` - Task lists (default)
- `doctors-note-zone` - Clinical notes
- `retrieved-data-zone` - EHR data
- `adv-event-zone` - Adverse events
- `raw-ehr-data-zone` - Raw records

## 🎯 Manual Positioning

Add `x`, `y`, `width`, `height` for exact placement:

```json
{
  "x": 5860,
  "y": -2240,
  "width": 900,
  "height": 800,
  // ... rest of data
}
```

## 🧪 Test Script

Run the test script to create sample items:

```bash
node test-dili-patient-api.js
```

## 📚 Full Documentation

For complete API documentation with all fields and examples:
- [DILI_PATIENT_REPORT_API.md](documentation/DILI_PATIENT_REPORT_API.md)
- [API-COMMANDS.md](API-COMMANDS.md)

## ✨ Features

### DILI Diagnostic Panel
- ✅ Expandable sections
- ✅ Lab values with indicators
- ✅ Causality analysis
- ✅ Severity assessment
- ✅ Management checklist
- ✅ PDF export
- ✅ Print support

### Patient Report
- ✅ View/Edit modes
- ✅ Demographics
- ✅ Problem list
- ✅ Medications
- ✅ Allergies
- ✅ Management plan
- ✅ PDF export
- ✅ Print support

## 🔧 JavaScript Example

```javascript
// Create DILI Diagnostic
const response = await fetch('http://localhost:3001/api/dili-diagnostic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pattern: { /* ... */ },
    causality: { /* ... */ },
    severity: { /* ... */ },
    management: { /* ... */ },
    zone: "task-management-zone"
  })
});

const data = await response.json();
console.log('Created:', data.id);
```

## 🐍 Python Example

```python
import requests

response = requests.post(
    'http://localhost:3001/api/dili-diagnostic',
    json={
        'pattern': { # ... },
        'causality': { # ... },
        'severity': { # ... },
        'management': { # ... },
        'zone': 'task-management-zone'
    }
)

print(response.json())
```

## ⚡ Quick Tips

1. **Auto-positioning**: Omit `x` and `y` for automatic placement
2. **Zone-based**: Use `zone` parameter for organized layout
3. **Manual control**: Provide `x`, `y`, `width`, `height` for exact placement
4. **Real-time**: Changes broadcast via SSE to all clients
5. **Persistent**: Items saved to Redis across server restarts

## 🆘 Troubleshooting

**Server not responding?**
```bash
curl http://localhost:3001/api/health
```

**Check existing items:**
```bash
curl http://localhost:3001/api/board-items | jq 'length'
```

**Clear test items:**
```bash
curl -X DELETE http://localhost:3001/api/dynamic-items
```

## 📞 Support

- Main API docs: [API-COMMANDS.md](API-COMMANDS.md)
- Full documentation: [documentation/DILI_PATIENT_REPORT_API.md](documentation/DILI_PATIENT_REPORT_API.md)
- Test script: `test-dili-patient-api.js`
