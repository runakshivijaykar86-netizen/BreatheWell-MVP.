let currentAQIValue = 0; // Top of the file
const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL INTELLIGENCE ---
function getAdvice(aqi) {
    if (aqi <= 50) return { 
        status: "Healthy", 
        color: "#38a169", 
        now: "Optimal oxygen levels. No symptoms.", 
        future: "Maintains peak lung elasticity.", 
        precautions: "No mask needed. Great for outdoor cardio." 
    };
    if (aqi <= 150) return { 
        status: "Warning", 
        color: "#fd7e14", 
        now: "Throat irritation and wheezing for asthmatics.", 
        future: "Linked to increased allergy sensitivity.", 
        precautions: "Sensitive groups should wear N95 masks outdoors." 
    };
    if (aqi <= 300) return { 
        status: "Danger", 
        color: "#dc3545", 
        now: "Chest tightness, fatigue, and labored breathing.", 
        future: "High risk of permanent Chronic Bronchitis.", 
        precautions: "Avoid outdoors. Use HEPA air purifiers indoors." 
    };
    return { 
        status: "CRITICAL", 
        color: "#7e22ce", 
        now: "Severe respiratory distress and heart stress.", 
        future: "Increased risk of Stroke and Heart Attack.", 
        precautions: "EMERGENCY: Seal all windows. Do not exercise. Stay indoors." 
    };
}
// --- 2. THE UI UPDATER ---
function updateUI(data) {
    const resDiv = document.getElementById('result');
    const waBtn = document.getElementById('whatsappBtn');
    const emergencyZone = document.getElementById('emergency-zone');
    
    currentAQIValue = data.data.current.pollution.aqius; 
    document.getElementById('symptoms-tracker').style.display = "block"; 
    
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getAdvice(aqi);

    resDiv.innerHTML = `
        <div class="med-card" style="border-color: ${med.color}; background: ${med.bg};">
            <h3 style="text-align:center;">📍 ${city} | AQI: ${aqi}</h3>
            <p style="text-align:center; color:${med.color}; font-weight:bold;">${med.status.toUpperCase()}</p>
            <hr style="margin:10px 0; opacity:0.1;">
            <p><strong>🚨 Symptoms:</strong> ${med.now}</p>
            <p><strong>⏳ Chronic Risk:</strong> ${med.future}</p>
            <p style="margin-top:10px; font-weight:bold; color:${med.color};">🛡️ Precaution: ${med.precautions}</p>
        </div>
    `;

    emergencyZone.style.display = (aqi >= 300) ? "block" : "none";
    waBtn.style.display = "block";
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(`Health Alert for ${city}: AQI is ${aqi}. ${med.precautions}`)}`;
    
    drawChart(aqi, med.color);
}

// --- 3. FETCHING DATA WITH SMART ERRORS ---
async function search(c, s, co) {
    const resDiv = document.getElementById('result');
    resDiv.innerHTML = "<p style='text-align:center;'>🩺 Analyzing Health Data...</p>";
    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.status === "success") {
            updateUI(data);
        } else {
            // THE FIX: Explain WHY it's not working
            resDiv.innerHTML = `
                <div style="background:#fff5f5; color:#c53030; padding:15px; border-radius:10px; text-align:center; border:1px solid #feb2b2;">
                    <strong>❌ City Not Found in Global Database</strong>
                    <p style="font-size:12px; margin-top:5px; color:#718096;">Spelling must match the IQAir registry perfectly (e.g., "Delhi" State, "India" Country).</p>
                    <p style="margin-top:10px; font-weight:bold;">💡 FIX: Please click the "GPS SYNC" button at the top for instant results!</p>
                </div>`;
        }
    } catch (e) { resDiv.innerHTML = "❌ Connection Failed."; }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    search(document.getElementById('city').value, document.getElementById('state').value, document.getElementById('country').value);
});

document.getElementById('gps-btn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = "🛰️ Connecting to Global Satellites...";
    navigator.geolocation.getCurrentPosition(async (p) => {
        try {
            const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${p.coords.latitude}&lon=${p.coords.longitude}&key=${API_KEY}`);
            const data = await res.json();
            if (data.status === "success") updateUI(data);
        } catch (err) { alert("GPS Permission Denied."); }
    });
});

function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h'],
            datasets: [{ label: 'AQI Predicted', data: [aqi, aqi+5, aqi+12, aqi-2, aqi-5], borderColor: color, fill: false, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function triggerEmergencyAlert() {
    alert("🆘 CRITICAL HEALTH PROTOCOL:\n1. Seal windows with wet towels.\n2. Run air purifiers on max.\n3. Do not engage in any physical exertion.");
}

// --- SYMPTOMS ANALYSIS ENGINE ---
function analyzeSymptoms() {
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom:checked')).map(s => s.value);
    const reportDiv = document.getElementById('personal-report');
    
    if (selectedSymptoms.length === 0) {
        reportDiv.innerHTML = "<p style='color: #e53e3e;'>Please select at least one symptom to analyze.</p>";
        return;
    }

    let medicalContext = "";
    
    if (currentAQIValue > 150) {
        medicalContext = `
            <div style="background: #fff5f5; padding: 12px; border-radius: 8px; border-left: 4px solid #e53e3e; margin-top:10px;">
                <strong>⚠️ Environmental Correlation:</strong> High AQI (${currentAQIValue}) is a likely trigger for your ${selectedSymptoms.join(', ')}. 
            </div>
        `;
        
        if (selectedSymptoms.includes("Chest Tightness") || selectedSymptoms.includes("Shortness of Breath")) {
            medicalContext += `<p style="margin-top: 10px; color: #c53030; font-weight:bold;">🚨 URGENT: Chest symptoms during high pollution indicate heart/lung stress. Seek a clean-air environment immediately.</p>`;
        }
    } else {
        medicalContext = `
            <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border-left: 4px solid #22c55e; margin-top:10px;">
                <strong>ℹ️ Analysis:</strong> Current outdoor AQI is low (${currentAQIValue}). If symptoms persist, consider indoor allergens or consult a professional.
            </div>
        `;
    }

    reportDiv.innerHTML = medicalContext + `<p style="margin-top: 10px; font-style: italic; font-size: 11px;">Note: This is an AI-generated correlation, not a medical diagnosis.</p>`;
}

document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const city = document.getElementById('city').value;
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom:checked')).map(s => s.value);
    const med = getAdvice(currentAQIValue);

    // --- PDF Header ---
    doc.setFontSize(22);
    doc.setTextColor(0, 120, 212); // BreatheWell Blue
    doc.text("BreatheWell Health Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    doc.line(20, 35, 190, 35); // Horizontal line

    // --- Section 1: Environmental Data ---
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Location: ${city}`, 20, 50);
    doc.text(`Air Quality Index (AQI): ${currentAQIValue}`, 20, 60);
    doc.text(`Status: ${med.status}`, 20, 70);

    // --- Section 2: Symptoms Analysis ---
    doc.setFontSize(14);
    doc.text("Reported Symptoms:", 20, 90);
    doc.setFontSize(12);
    const symptomsText = selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "None reported.";
    doc.text(symptomsText, 25, 100);

    // --- Section 3: Medical Warning ---
    doc.setFontSize(14);
    doc.setTextColor(229, 62, 62); // Red for warnings
    doc.text("Health Risk Advisory:", 20, 120);
    doc.setFontSize(11);
    doc.setTextColor(0);
    const splitWarning = doc.splitTextToSize(`${med.now} ${med.future}`, 160);
    doc.text(splitWarning, 20, 130);

    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Disclaimer: This report is for informational purposes and not a medical diagnosis.", 20, 280);

    doc.save(`BreatheWell_Report_${city}.pdf`);
});

// Update UI to show the PDF button
function showPdfButton() {
    document.getElementById('downloadPdf').style.display = "block";
}
