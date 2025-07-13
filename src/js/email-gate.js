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
    // Option 1: Send to Zapier webhook
    // fetch('https://hooks.zapier.com/hooks/catch/YOUR_ID/', {
    //     method: 'POST',
    //     body: JSON.stringify(userData)
    // });
    
    // Option 2: Send to Make.com (Integromat)
    // fetch('https://hook.integromat.com/YOUR_WEBHOOK_URL', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify(userData)
    // });
    
    // Option 3: Send to ConvertKit
    // fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({
    //         api_key: 'YOUR_API_KEY',
    //         email: userData.email,
    //         fields: {
    //             company_size: userData.companySize,
    //             pain_point: userData.painPoint
    //         }
    //     })
    // });
    
    // For now, just log to console (remove in production)
    console.log('User data collected:', userData);
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