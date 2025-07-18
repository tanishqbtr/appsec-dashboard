// Script to populate dummy risk assessment data for testing
const services = [
  "Hinge Health Web Portal",
  "Payment Processing API", 
  "User Authentication Service",
  "Data Analytics Platform",
  "Mobile Application Backend",
  "Notification Service",
  "File Storage Service",
  "Exercise Video Platform",
  "Shipment Tracking Service",
  "Telemedicine Platform"
];

const riskAssessmentOptions = {
  dataClassification: ["sensitive-regulated", "restricted", "confidential", "public"],
  phi: ["yes", "no"],
  eligibilityData: ["yes", "no"],
  confidentialityImpact: ["high", "medium", "low"],
  integrityImpact: ["high", "medium", "low"],
  availabilityImpact: ["high", "medium", "low"],
  publicEndpoint: ["yes", "no"],
  discoverability: ["high", "medium", "low"],
  awareness: ["high", "medium", "low"]
};

function getRandomOption(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function calculateScores(factors) {
  // Data Classification Score
  let dataScore = 0;
  if (factors.dataClassification === "sensitive-regulated") dataScore += 4;
  else if (factors.dataClassification === "restricted") dataScore += 3;
  else if (factors.dataClassification === "confidential") dataScore += 2;
  else dataScore += 1;
  
  if (factors.phi === "yes") dataScore += 3;
  if (factors.eligibilityData === "yes") dataScore += 2;
  
  // CIA Triad Score
  let ciaScore = 0;
  ["confidentialityImpact", "integrityImpact", "availabilityImpact"].forEach(impact => {
    if (factors[impact] === "high") ciaScore += 3;
    else if (factors[impact] === "medium") ciaScore += 2;
    else ciaScore += 1;
  });
  
  // Attack Surface Score
  let attackScore = 0;
  if (factors.publicEndpoint === "yes") attackScore += 3;
  if (factors.discoverability === "high") attackScore += 3;
  else if (factors.discoverability === "medium") attackScore += 2;
  else attackScore += 1;
  
  if (factors.awareness === "high") attackScore += 3;
  else if (factors.awareness === "medium") attackScore += 2;
  else attackScore += 1;
  
  const finalScore = Math.round((dataScore + ciaScore + attackScore) / 3 * 10) / 10;
  let riskLevel = "Low";
  if (finalScore >= 8) riskLevel = "Critical";
  else if (finalScore >= 6) riskLevel = "High";
  else if (finalScore >= 4) riskLevel = "Medium";
  
  return { dataScore, ciaScore, attackScore, finalScore, riskLevel };
}

async function populateRiskAssessments() {
  console.log("Populating risk assessments for all services...");
  
  for (const serviceName of services) {
    const factors = {
      dataClassification: getRandomOption(riskAssessmentOptions.dataClassification),
      phi: getRandomOption(riskAssessmentOptions.phi),
      eligibilityData: getRandomOption(riskAssessmentOptions.eligibilityData),
      confidentialityImpact: getRandomOption(riskAssessmentOptions.confidentialityImpact),
      integrityImpact: getRandomOption(riskAssessmentOptions.integrityImpact),
      availabilityImpact: getRandomOption(riskAssessmentOptions.availabilityImpact),
      publicEndpoint: getRandomOption(riskAssessmentOptions.publicEndpoint),
      discoverability: getRandomOption(riskAssessmentOptions.discoverability),
      awareness: getRandomOption(riskAssessmentOptions.awareness)
    };
    
    const scores = calculateScores(factors);
    
    const assessmentData = {
      serviceName,
      ...factors,
      dataClassificationScore: scores.dataScore,
      ciaTriadScore: scores.ciaScore,
      attackSurfaceScore: scores.attackScore,
      finalRiskScore: scores.finalScore,
      riskLevel: scores.riskLevel,
      updatedBy: "test-script"
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/risk-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      });
      
      if (response.ok) {
        console.log(`✓ Created risk assessment for ${serviceName} (Score: ${scores.finalScore}, Level: ${scores.riskLevel})`);
      } else {
        console.error(`✗ Failed to create risk assessment for ${serviceName}:`, await response.text());
      }
    } catch (error) {
      console.error(`✗ Error creating risk assessment for ${serviceName}:`, error.message);
    }
  }
  
  console.log("Risk assessment population complete!");
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { populateRiskAssessments, services, riskAssessmentOptions };
} else if (typeof window !== 'undefined') {
  window.populateRiskAssessments = populateRiskAssessments;
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  populateRiskAssessments();
}