// Email Gate Functionality for Bad Mobilization Calculator

// Check if user has already provided email
function hasUserProvidedEmail() {
    return localStorage.getItem('mobCalcEmail') !== null;
}

// Store user data
function storeUserData(email, companySize, painPoint, newsletter) {
    const userData = {
        email: email,
        companySize: companySize,
        painPoint: painPoint,
        newsletter: newsletter,
        timestamp: new Date().toISOString(),
        source: 'bad_mob_calc'
    };
    
    localStorage.setItem('mobCalcEmail', email);
    localStorage.setItem('mobCalcUserData', JSON.stringify(userData));
    
    // Send to your backend/webhook (implement based on your choice)
    sendToBackend(userData);
}

// Send data to backend (implement based on your setup)
function sendToBackend(userData) {
    // Send to MongoDB backend
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/leads'
        : '/api/leads'; // Uses same domain in production
    
    // Add calculator results to the user data
    const resultsData = {
        ...userData,
        calculatorData: {
            incidentCost: document.getElementById('incidentTotal')?.textContent || '0',
            annualCost: document.getElementById('annualTotal')?.textContent || '0',
            revenuePercentage: document.getElementById('revenuePercentage')?.textContent || '0'
        }
    };
    
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultsData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Lead saved successfully');
        }
    })
    .catch(error => {
        console.error('Error saving lead:', error);
        // Still allow calculation to proceed even if save fails
    });
}

// Show email gate modal
function showEmailGate() {
    document.getElementById('emailGate').style.display = 'block';
}

// Hide email gate modal
function hideEmailGate() {
    document.getElementById('emailGate').style.display = 'none';
}

// Override the form submission to show email gate
document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculatorForm');
    const emailForm = document.getElementById('emailForm');
    const originalSubmitHandler = calculatorForm.onsubmit;
    
    // Intercept calculator form submission
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // If user hasn't provided email, show gate
        if (!hasUserProvidedEmail()) {
            // Store form data temporarily
            window.pendingCalculation = new FormData(calculatorForm);
            showEmailGate();
        } else {
            // Process calculation normally
            processCalculation();
        }
    });
    
    // Handle email form submission
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('userEmail').value;
        const companySize = document.getElementById('companySize').value;
        const painPoint = document.getElementById('painPoint').value;
        const newsletter = document.getElementById('newsletter').checked;
        
        // Store user data
        storeUserData(email, companySize, painPoint, newsletter);
        
        // Hide modal
        hideEmailGate();
        
        // Process the pending calculation
        processCalculation();
    });
});

// Process the calculation after email is collected
function processCalculation() {
    const form = document.getElementById('calculatorForm');
    const resultsSection = document.getElementById('results');
    
    // Gather inputs
    const inputs = {
        crewSize: parseInt(document.getElementById('crewSize').value),
        hourlyRate: parseFloat(document.getElementById('hourlyRate').value),
        mobilizationDistance: parseFloat(document.getElementById('mobilizationDistance').value),
        projectComplexity: document.getElementById('projectComplexity').value,
        idleHours: parseFloat(document.getElementById('idleHours').value),
        equipmentDailyRate: parseFloat(document.getElementById('equipmentDailyRate').value),
        numberOfVehicles: parseInt(document.getElementById('numberOfVehicles').value),
        remobilizationRequired: document.getElementById('remobilizationRequired').value,
        annualRevenue: parseFloat(document.getElementById('annualRevenue').value),
        customerLifetimeValue: parseFloat(document.getElementById('customerLifetimeValue').value),
        incidentsPerMonth: parseFloat(document.getElementById('incidentsPerMonth').value),
        overheadRate: parseFloat(document.getElementById('overheadRate').value)
    };
    
    // Calculate results
    const calculator = new BadMobilizationCalculator(inputs);
    const results = calculator.calculate();
    
    // Update UI
    updateResults(results);
    
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}