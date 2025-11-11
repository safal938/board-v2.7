/**
 * Test Script for DILI Diagnostic and Patient Report API Endpoints
 * 
 * Usage:
 *   node test-dili-patient-api.js
 * 
 * Make sure your server is running on http://localhost:3001
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Test data for DILI Diagnostic Panel
const diliDiagnosticData = {
  pattern: {
    classification: "Hepatocellular",
    R_ratio: 12.5,
    keyLabs: [
      {
        label: "ALT",
        value: "850 U/L",
        note: "↑↑"
      },
      {
        label: "AST",
        value: "720 U/L",
        note: "↑↑"
      },
      {
        label: "ALP",
        value: "180 U/L",
        note: "↑"
      },
      {
        label: "Total Bilirubin",
        value: "3.2 mg/dL",
        note: "↑"
      }
    ],
    clinicalFeatures: [
      "Acute onset of jaundice",
      "Fatigue and malaise",
      "Right upper quadrant discomfort",
      "No fever or rash"
    ]
  },
  causality: {
    primaryDrug: "Amoxicillin-Clavulanate",
    contributingFactors: [
      "Age > 60 years",
      "Female gender",
      "Duration of therapy: 14 days",
      "No alternative causes identified"
    ],
    mechanisticRationale: [
      "Idiosyncratic hepatotoxicity",
      "Immune-mediated mechanism suspected",
      "Temporal relationship: onset 5 days after completion",
      "RUCAM score: 8 (Probable)"
    ]
  },
  severity: {
    features: [
      "Hy's Law criteria met (ALT >3x ULN + Bilirubin >2x ULN)",
      "INR: 1.4 (mildly elevated)",
      "No encephalopathy",
      "No ascites"
    ],
    prognosis: "Moderate severity. Close monitoring required. Expected resolution with drug discontinuation, but risk of progression exists."
  },
  management: {
    immediateActions: [
      "Discontinue amoxicillin-clavulanate immediately",
      "Avoid all hepatotoxic medications",
      "Monitor LFTs every 2-3 days initially",
      "Check INR, albumin, and complete metabolic panel"
    ],
    consults: [
      "Hepatology consultation for severity assessment",
      "Consider infectious disease if alternative infection suspected"
    ],
    monitoringPlan: [
      "Weekly LFTs until normalization",
      "Monitor for signs of acute liver failure",
      "Patient education on warning signs",
      "Document in allergy list"
    ]
  },
  zone: "task-management-zone"
};

// Test data for Patient Report
const patientReportData = {
  patientData: {
    name: "Jane Smith",
    date_of_birth: "1965-03-15",
    age: 58,
    sex: "Female",
    mrn: "MRN-789456",
    primaryDiagnosis: "Drug-Induced Liver Injury (DILI) secondary to Amoxicillin-Clavulanate",
    problem_list: [
      {
        name: "Hypertension",
        status: "Active"
      },
      {
        name: "Type 2 Diabetes Mellitus",
        status: "Active"
      },
      {
        name: "Hyperlipidemia",
        status: "Active"
      }
    ],
    allergies: [
      "Penicillin - Rash",
      "Sulfa drugs - Stevens-Johnson Syndrome"
    ],
    medication_history: [
      {
        name: "Lisinopril",
        dose: "10mg daily"
      },
      {
        name: "Metformin",
        dose: "1000mg twice daily"
      },
      {
        name: "Atorvastatin",
        dose: "20mg daily"
      },
      {
        name: "Amoxicillin-Clavulanate",
        dose: "875-125mg twice daily (DISCONTINUED)"
      }
    ],
    acute_event_summary: "Patient presented with jaundice, fatigue, and elevated liver enzymes 5 days after completing a 14-day course of amoxicillin-clavulanate for sinusitis. Laboratory findings consistent with hepatocellular injury pattern. No alternative causes identified on workup.",
    diagnosis_acute_event: [
      "Drug-Induced Liver Injury (DILI) - Probable",
      "Hepatocellular injury pattern",
      "RUCAM score: 8 (Probable causality)"
    ],
    causality: "Amoxicillin-clavulanate is the most likely causative agent based on temporal relationship, absence of alternative causes, and characteristic injury pattern. Patient has risk factors including age >60 and female gender.",
    management_recommendations: [
      "Immediate discontinuation of amoxicillin-clavulanate",
      "Hepatology consultation for severity assessment",
      "Serial monitoring of liver function tests",
      "Avoid hepatotoxic medications",
      "Patient education on warning signs of liver failure",
      "Document drug allergy in medical record"
    ]
  },
  zone: "doctors-note-zone"
};

// Helper function to make API calls
async function apiCall(endpoint, data) {
  try {
    console.log(`\n🚀 Testing ${endpoint}...`);
    console.log('📤 Request data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Error ${response.status}:`, error);
      return null;
    }

    const result = await response.json();
    console.log('✅ Success! Created item:', result.id);
    console.log('📍 Position:', `(${result.x}, ${result.y})`);
    console.log('📦 Type:', result.type);
    console.log('🎯 Zone:', data.zone || 'task-management-zone (default)');
    
    return result;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  DILI Diagnostic & Patient Report API Test Suite          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 API Base URL: ${API_BASE_URL}`);
  
  // Test 1: Create DILI Diagnostic Panel
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Create DILI Diagnostic Panel');
  console.log('='.repeat(60));
  const diliResult = await apiCall('/api/dili-diagnostic', diliDiagnosticData);
  
  // Wait a bit before next test
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Create Patient Report
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Create Patient Report');
  console.log('='.repeat(60));
  const patientResult = await apiCall('/api/patient-report', patientReportData);
  
  // Test 3: Create DILI Diagnostic with manual positioning
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Create DILI Diagnostic with Manual Position');
  console.log('='.repeat(60));
  const diliManualData = {
    ...diliDiagnosticData,
    x: 6500,
    y: -2000,
    width: 950,
    height: 850
  };
  const diliManualResult = await apiCall('/api/dili-diagnostic', diliManualData);
  
  // Wait a bit before next test
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Create Patient Report in different zone
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Create Patient Report in Retrieved Data Zone');
  console.log('='.repeat(60));
  const patientZoneData = {
    ...patientReportData,
    zone: "retrieved-data-zone"
  };
  const patientZoneResult = await apiCall('/api/patient-report', patientZoneData);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ DILI Diagnostic (auto-positioned): ${diliResult ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Patient Report (auto-positioned): ${patientResult ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ DILI Diagnostic (manual position): ${diliManualResult ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Patient Report (different zone): ${patientZoneResult ? 'PASSED' : 'FAILED'}`);
  
  const successCount = [diliResult, patientResult, diliManualResult, patientZoneResult].filter(Boolean).length;
  console.log(`\n📊 Results: ${successCount}/4 tests passed`);
  
  if (successCount === 4) {
    console.log('\n🎉 All tests passed! Check your board to see the new items.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
