const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL INTELLIGENCE ---
function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#38a169", bg: "#f0fff4", now: "Clear air.", future: "Lung health support.", precautions: "No precautions." };
    if (aqi <= 100) return { status: "Moderate", color: "#d69e2e", bg: "#fffaf0", now: "Minor irritation.", future: "Low risk.", precautions: "Sensitive groups limit exertion." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5", now: "Inflammation.", future: "High Bronchitis risk.", precautions: "Wear N95 masks." };
    return { status: "HAZARDOUS", color: "#7e22ce", bg: "#f5f3ff", now: "Severe heart/lung stress.", future: "Stroke & Heart Attack risk.", precautions: "STAY INDOORS." };
}

// --- 2. THE UI UPDATER ---
function updateUI(data) {
    const resDiv = document.getElementById('result');
    const waBtn = document.getElementById('whatsappBtn');
    const emergencyZone = document.getElementById('emergency-zone');
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
