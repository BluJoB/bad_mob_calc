// Bad Mobilization Calculator - Core Calculation Engine
// Based on research from Harvard Business School, FMI Corporation, and AAA

// Constants based on research
const CONSTANTS = {
    // Labor burden rate (payroll taxes, insurance, benefits)
    BURDEN_RATE: 0.35,
    
    // Vehicle costs per mile (AAA research)
    FUEL_COST_PER_MILE: 0.67,
    VEHICLE_WEAR_PER_MILE: 0.40,
    
    // Industry averages
    PM_HOURLY_RATE: 75,
    TRADE_COORDINATION_HOURS: 2,
    SCHEDULE_REVISION_HOURS: 3,
    
    // Risk factors
    CUSTOMER_DISSATISFACTION_RISK: 0.15,
    REPEAT_BUSINESS_LOSS_RISK: 0.25,
    
    // Efficiency factors
    REMOBILIZATION_EFFICIENCY: 0.8,
    PREVENTION_EFFECTIVENESS: 0.85
};

// Main calculator class
class BadMobilizationCalculator {
    constructor(inputs) {
        this.inputs = inputs;
        this.results = {};
    }

    calculate() {
        // Layer 1: Direct Costs
        this.calculateDirectCosts();
        
        // Layer 2: Cascade Costs  
        this.calculateCascadeCosts();
        
        // Layer 3: Strategic Costs
        this.calculateStrategicCosts();
        
        // Total Impact
        this.calculateTotalImpact();
        
        return this.results;
    }

    calculateDirectCosts() {
        const { crewSize, hourlyRate, idleHours, mobilizationDistance, numberOfVehicles, equipmentDailyRate } = this.inputs;
        
        // Labor costs including burden
        const baseLaborCost = crewSize * hourlyRate * idleHours;
        const laborCostWithBurden = baseLaborCost * (1 + CONSTANTS.BURDEN_RATE);
        
        // Transportation costs (round trip)
        const totalMiles = mobilizationDistance * 2 * numberOfVehicles;
        const fuelCost = totalMiles * CONSTANTS.FUEL_COST_PER_MILE;
        const wearCost = totalMiles * CONSTANTS.VEHICLE_WEAR_PER_MILE;
        const transportationCost = fuelCost + wearCost;
        
        // Equipment idle cost (proportional to idle hours)
        const equipmentCost = (equipmentDailyRate / 8) * idleHours;
        
        this.results.laborCost = laborCostWithBurden;
        this.results.transportationCost = transportationCost;
        this.results.equipmentCost = equipmentCost;
        this.results.layer1Total = laborCostWithBurden + transportationCost + equipmentCost;
    }

    calculateCascadeCosts() {
        const { projectComplexity, idleHours, overheadRate, annualRevenue } = this.inputs;
        const complexityMultiplier = parseFloat(projectComplexity);
        
        // Trade coordination delays
        const tradeCost = CONSTANTS.TRADE_COORDINATION_HOURS * CONSTANTS.PM_HOURLY_RATE * complexityMultiplier;
        
        // Schedule compression costs (expediting, overtime)
        const scheduleCost = CONSTANTS.SCHEDULE_REVISION_HOURS * CONSTANTS.PM_HOURLY_RATE * complexityMultiplier * 1.5;
        
        // Fixed cost loss (overhead continues during delays)
        const dailyOverhead = (annualRevenue * (overheadRate / 100)) / 250; // 250 working days
        const fixedCostLoss = (dailyOverhead / 8) * idleHours;
        
        this.results.tradeCost = tradeCost;
        this.results.scheduleCost = scheduleCost;
        this.results.fixedCostLoss = fixedCostLoss;
        this.results.layer2Total = tradeCost + scheduleCost + fixedCostLoss;
    }

    calculateStrategicCosts() {
        const { remobilizationRequired, customerLifetimeValue, projectComplexity } = this.inputs;
        const complexityMultiplier = parseFloat(projectComplexity);
        
        // Remobilization costs (80% of original mobilization due to inefficiency)
        let remobilizationCost = 0;
        if (parseInt(remobilizationRequired) === 1) {
            remobilizationCost = this.results.layer1Total * CONSTANTS.REMOBILIZATION_EFFICIENCY;
        }
        
        // Customer relationship impact
        const customerImpact = customerLifetimeValue * CONSTANTS.CUSTOMER_DISSATISFACTION_RISK * complexityMultiplier;
        
        // Future revenue at risk
        const revenueRisk = customerLifetimeValue * CONSTANTS.REPEAT_BUSINESS_LOSS_RISK * complexityMultiplier;
        
        this.results.remobilizationCost = remobilizationCost;
        this.results.customerImpact = customerImpact;
        this.results.revenueRisk = revenueRisk;
        this.results.layer3Total = remobilizationCost + customerImpact + revenueRisk;
    }

    calculateTotalImpact() {
        const { incidentsPerMonth, annualRevenue } = this.inputs;
        
        // Per incident total
        this.results.incidentTotal = this.results.layer1Total + this.results.layer2Total + this.results.layer3Total;
        
        // Annual impact
        this.results.annualTotal = this.results.incidentTotal * incidentsPerMonth * 12;
        
        // Percentage of revenue
        this.results.revenuePercentage = (this.results.annualTotal / annualRevenue) * 100;
        
        // Potential savings with prevention
        this.results.potentialSavings = this.results.annualTotal * CONSTANTS.PREVENTION_EFFECTIVENESS;
        
        // ROI multiple (typical PM system costs ~$50k/year)
        this.results.roiMultiple = Math.round(this.results.potentialSavings / 50000);
    }
}

// Form handling and UI updates
document.addEventListener('DOMContentLoaded', function() {
    // Export functionality
    document.getElementById('exportResults').addEventListener('click', exportResults);
    document.getElementById('shareResults').addEventListener('click', shareResults);
});

function updateResults(results) {
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    // Layer 1
    document.getElementById('laborCost').textContent = formatCurrency(results.laborCost);
    document.getElementById('transportationCost').textContent = formatCurrency(results.transportationCost);
    document.getElementById('equipmentCost').textContent = formatCurrency(results.equipmentCost);
    document.getElementById('layer1Total').textContent = formatCurrency(results.layer1Total);
    
    // Layer 2
    document.getElementById('tradeCost').textContent = formatCurrency(results.tradeCost);
    document.getElementById('scheduleCost').textContent = formatCurrency(results.scheduleCost);
    document.getElementById('fixedCostLoss').textContent = formatCurrency(results.fixedCostLoss);
    document.getElementById('layer2Total').textContent = formatCurrency(results.layer2Total);
    
    // Layer 3
    document.getElementById('remobilizationCost').textContent = formatCurrency(results.remobilizationCost);
    document.getElementById('customerImpact').textContent = formatCurrency(results.customerImpact);
    document.getElementById('revenueRisk').textContent = formatCurrency(results.revenueRisk);
    document.getElementById('layer3Total').textContent = formatCurrency(results.layer3Total);
    
    // Totals
    document.getElementById('incidentTotal').textContent = formatCurrency(results.incidentTotal);
    document.getElementById('annualTotal').textContent = formatCurrency(results.annualTotal);
    document.getElementById('revenuePercentage').textContent = results.revenuePercentage.toFixed(1) + '%';
    
    // ROI Analysis
    document.getElementById('potentialSavings').textContent = formatCurrency(results.potentialSavings);
    document.getElementById('roiMultiple').textContent = results.roiMultiple + 'x';
}

function exportResults() {
    // Gather all results
    const results = {
        timestamp: new Date().toISOString(),
        inputs: gatherFormInputs(),
        calculations: gatherCalculationResults()
    };
    
    // Create CSV content
    const csv = convertToCSV(results);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `bad_mobilization_analysis_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function shareResults() {
    const incidentTotal = document.getElementById('incidentTotal').textContent;
    const annualTotal = document.getElementById('annualTotal').textContent;
    const percentage = document.getElementById('revenuePercentage').textContent;
    
    const shareText = `Bad Mobilization Calculator Results:\n` +
        `Cost per incident: ${incidentTotal}\n` +
        `Annual impact: ${annualTotal} (${percentage} of revenue)\n` +
        `Calculate your costs: https://hc-build.com/tools/bad-mob-calc\n` +
        `Built by @HarlanCharles`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Bad Mobilization Cost Analysis',
            text: shareText,
            url: 'https://hc-build.com/tools/bad-mob-calc'
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

function gatherFormInputs() {
    const inputs = {};
    const form = document.getElementById('calculatorForm');
    const formData = new FormData(form);
    
    for (let [key, value] of formData.entries()) {
        inputs[key] = value;
    }
    
    return inputs;
}

function gatherCalculationResults() {
    return {
        layer1: {
            labor: document.getElementById('laborCost').textContent,
            transportation: document.getElementById('transportationCost').textContent,
            equipment: document.getElementById('equipmentCost').textContent,
            total: document.getElementById('layer1Total').textContent
        },
        layer2: {
            trade: document.getElementById('tradeCost').textContent,
            schedule: document.getElementById('scheduleCost').textContent,
            fixed: document.getElementById('fixedCostLoss').textContent,
            total: document.getElementById('layer2Total').textContent
        },
        layer3: {
            remobilization: document.getElementById('remobilizationCost').textContent,
            customer: document.getElementById('customerImpact').textContent,
            revenue: document.getElementById('revenueRisk').textContent,
            total: document.getElementById('layer3Total').textContent
        },
        summary: {
            incident: document.getElementById('incidentTotal').textContent,
            annual: document.getElementById('annualTotal').textContent,
            percentage: document.getElementById('revenuePercentage').textContent
        }
    };
}

function convertToCSV(data) {
    let csv = 'Bad Mobilization Cost Analysis\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'INPUT PARAMETERS\n';
    for (let [key, value] of Object.entries(data.inputs)) {
        csv += `${key},${value}\n`;
    }
    
    csv += '\nCALCULATION RESULTS\n';
    csv += 'Category,Item,Amount\n';
    
    // Layer 1
    csv += `Layer 1,Labor Costs,${data.calculations.layer1.labor}\n`;
    csv += `Layer 1,Transportation,${data.calculations.layer1.transportation}\n`;
    csv += `Layer 1,Equipment,${data.calculations.layer1.equipment}\n`;
    csv += `Layer 1,Total,${data.calculations.layer1.total}\n`;
    
    // Layer 2
    csv += `Layer 2,Trade Coordination,${data.calculations.layer2.trade}\n`;
    csv += `Layer 2,Schedule Compression,${data.calculations.layer2.schedule}\n`;
    csv += `Layer 2,Fixed Cost Loss,${data.calculations.layer2.fixed}\n`;
    csv += `Layer 2,Total,${data.calculations.layer2.total}\n`;
    
    // Layer 3
    csv += `Layer 3,Remobilization,${data.calculations.layer3.remobilization}\n`;
    csv += `Layer 3,Customer Impact,${data.calculations.layer3.customer}\n`;
    csv += `Layer 3,Revenue Risk,${data.calculations.layer3.revenue}\n`;
    csv += `Layer 3,Total,${data.calculations.layer3.total}\n`;
    
    // Summary
    csv += `\nSUMMARY\n`;
    csv += `Per Incident Cost,${data.calculations.summary.incident}\n`;
    csv += `Annual Impact,${data.calculations.summary.annual}\n`;
    csv += `Percentage of Revenue,${data.calculations.summary.percentage}\n`;
    
    return csv;
}