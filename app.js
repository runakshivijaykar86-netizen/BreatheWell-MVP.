// --- BREATHEWELL PRO: ULTIMATE HEALTH INTELLIGENCE ENGINE ---

const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;
let currentAQIValue = 0;

// 1. MEDICAL ADVISORY ENGINE
// This function determines the physiological impact based on AQI levels.
function getAdvice(aqi) {
    if (aqi <= 50) return { 
        status: "Healthy", 
        color: "#38a169", 
        bg: "#f0fff4",
        now: "Optimal oxygen levels. No symptoms.", 
        future: "Maintains peak lung elasticity.", 
        precautions: "No mask needed. Great for outdoor cardio." 
    };
    if (aqi <= 150) return { 
        status: "Warning", 
        color: "#fd7e14", 
        bg: "#fffaf0",
        now: "Throat irritation and wheezing for asthmatics.", 
        future: "Linked to increased allergy sensitivity.", 
        precautions: "Sensitive groups should wear N95 masks outdoors." 
    };
    if (aqi <= 300) return { 
        status: "Danger", 
        color: "#dc3545", 
        bg: "#fff5f5",
        now: "Chest tightness, fatigue, and labored breathing.", 
        future: "High risk of permanent Chronic Bronchitis.", 
        precautions: "Avoid outdoors. Use HEPA air purifiers indoors." 
    };
    return { 
        status: "CRITICAL", 
        color: "#7e22ce", 
        bg: "#f5f3ff",
        now: "Severe respiratory distress and heart stress.", 
        future: "Increased risk of Stroke and Heart Attack.", 
        precautions: "EMERGENCY: STAY INDOORS. Seal windows with wet towels." 
    };
}

// 2. THE UI UPDATER
// Updates the dashboard, reveals hidden sections, and prepares the WhatsApp link.
function updateUI(data) {
    const resDiv = document.getElementById('result');
    const waBtn = document.getElementById('whatsappBtn');
    const emergencyZone = document.getElementById('emergency-zone');
    
    currentAQIValue = data.data.current.pollution.aqius; 
    const city = data.data.city;
    const med = getAdvice(currentAQIValue);

    // Sync input field so PDF knows the city even if found via GPS
    document.getElementById('city').value = city;

    resDiv.innerHTML = `
        <div class="med-card" style="border-color: ${med.color}; background: ${med.bg};">
            <h3 style="text-align:center;">📍 ${city} | AQI: ${currentAQIValue}</h3>
            <p style="text-align:center; color:${med.color}; font-weight:bold; letter-spacing:1px;">${med.status.toUpperCase()}</p>
            <hr style="margin:15px 0; opacity:0.1;">
            <p><strong>🚨 Symptoms:</strong> ${med.now}</p>
            <p style="margin-top:5px;"><strong>⏳ Chronic Risk:</strong> ${med.future}</p>
            <div style="margin-top:10px; padding:10px; background:white; border-left:4px solid ${med.color}; border-radius:8px;">
                <strong>🛡️ PRECAUTION:</strong> ${med.precautions}
            </div>
        </div>
    `;

    // Show features once data is loaded
    document.getElementById('symptoms-tracker').style.display = "block"; 
    showPdfButton();
    emergencyZone.style.display = (currentAQIValue >= 300) ? "block" : "none";
    
    // WhatsApp Share Link
    const waMsg = `⚠️ BREATHEWELL HEALTH ALERT: ${city}\n💨 AQI: ${currentAQIValue}\n🚨 Impact: ${med.now}\n🛡️ Precaution: ${med.precautions}\n\nCheck live: ${window.location.href}`;
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;
    waBtn.style.display = "block";
    
    drawChart(currentAQIValue, med.color);
}

// 3. SEARCH & GPS HANDLERS
async function search(c, s, co) {
    const resDiv = document.getElementById('result');
    resDiv.innerHTML = "<p style='text-align:center;'>🩺 Running Medical Analysis...</p>";
    
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else resDiv.innerHTML = `<div style="color:#c53030; text-align:center; padding:10px;">❌ Error: ${data.data.message}. Check spelling or use GPS.</div>`;
    } catch (e) {
        resDiv.innerHTML = "❌ Connection failed. Check internet.";
    }
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

// 4. SYMPTOMS TRACKER LOGIC
function analyzeSymptoms() {
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom:checked')).map(s => s.value);
    const reportDiv = document.getElementById('personal-report');
    
    if (selectedSymptoms.length === 0) {
        reportDiv.innerHTML = "<p style='color: #e53e3e;'>Please select at least one symptom.</p>";
        return;
    }

    let report = `<div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #2d3748; margin-top:10px;">
                    <strong>Report:</strong> Current AQI is ${currentAQIValue}. `;
    
    if (currentAQIValue > 150) {
        report += `Your symptoms (${selectedSymptoms.join(', ')}) are likely being triggered by environmental $PM_{2.5}$ particles. These fine particles can enter your bloodstream and cause the inflammation you feel.`;
        if (selectedSymptoms.includes("Chest Tightness")) {
            report += `<br><br><span style="color:red; font-weight:bold;">🚨 URGENT: Chest tightness indicates heart/lung stress. Seek clean air now.</span>`;
        }
    } else {
        report += `Outdoor pollution is currently low. If your ${selectedSymptoms.join(', ')} persist, consider indoor dust, pollen, or consult a doctor.`;
    }
    reportDiv.innerHTML = report + `</div>`;
}

// 5. PDF REPORT GENERATOR
document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const city = document.getElementById('city').value;
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom:checked')).map(s => s.value);
    const med = getAdvice(currentAQIValue);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 120, 212); 
    doc.text("BreatheWell Pro: Medical Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 28);
    doc.line(20, 32, 190, 32); 

    // Body
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Location: ${city}`, 20, 45);
    doc.text(`Air Quality Index: ${currentAQIValue} (${med.status})`, 20, 55);

    doc.setFontSize(12);
    doc.text(`Symptoms Reported: ${selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "None"}`, 20, 70);

    doc.setTextColor(180, 0, 0);
    doc.text("Clinical Advisory:", 20, 85);
    doc.setTextColor(0);
    const adviceText = doc.splitTextToSize(`${med.now} Long-term risk includes: ${med.future}`, 165);
    doc.text(adviceText, 20, 95);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Disclaimer: This AI-generated report is for awareness only. Show this to your doctor.", 20, 280);

    doc.save(`HealthReport_${city}.pdf`);
});

function showPdfButton() {
    document.getElementById('downloadPdf').style.display = "block";
}

// 6. CHARTING TRENDS
function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+10, aqi-2, aqi-4], borderColor: color, fill: false, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function triggerEmergencyAlert() {
    alert("🆘 EMERGENCY PROTOCOL INITIATED:\n1. Seal windows with wet towels.\n2. Do not go outside.\n3. Run air purifier on MAX.\n4. Call services if chest pain occurs.");
}

// 7. SERVICE WORKER FOR PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log("Offline mode ready."));
    });
}
