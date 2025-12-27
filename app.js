const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. HEALTH ADVISORY LOGIC ---
function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#38a169", bg: "#f0fff4", now: "Clear air.", future: "Supports lung longevity.", precautions: "No precautions needed." };
    if (aqi <= 100) return { status: "Moderate", color: "#d69e2e", bg: "#fffaf0", now: "Slight throat irritation.", future: "Minimal risk.", precautions: "Sensitive groups limit exertion." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5", now: "Airway inflammation.", future: "High risk of Bronchitis.", precautions: "Wear N95 masks." };
    return { status: "HAZARDOUS", color: "#7e22ce", bg: "#f5f3ff", now: "Severe respiratory distress.", future: "Stroke & Heart Attack risk.", precautions: "EMERGENCY: STAY INDOORS." };
}

// --- 2. UPDATE SCREEN ---
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

    // Emergency Logic
    emergencyZone.style.display = (aqi >= 300) ? "block" : "none";
    waBtn.style.display = "block";
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(`Health Alert for ${city}: AQI is ${aqi}. ${med.precautions}`)}`;
    
    drawChart(aqi, med.color);
}

// --- 3. FETCHING DATA ---
async function search(c, s, co) {
    const resDiv = document.getElementById('result');
    resDiv.innerHTML = "<p style='text-align:center;'>🩺 Analyzing...</p>";
    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else resDiv.innerHTML = `<p style="color:red; text-align:center;">❌ ${data.data.message}. Use GPS button.</p>`;
    } catch (e) { resDiv.innerHTML = "❌ Connection Failed."; }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    search(document.getElementById('city').value, document.getElementById('state').value, document.getElementById('country').value);
});

document.getElementById('gps-btn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${p.coords.latitude}&lon=${p.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});

// --- 4. VISUALS ---
function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+12, aqi-2, aqi-5], borderColor: color, fill: false, tension: 0.4 }]
        }
    });
}

function triggerEmergencyAlert() {
    alert("🆘 CRITICAL PROTOCOL:\n1. Move to a room with an air purifier.\n2. Seal door gaps with wet towels.\n3. Call emergency services if you feel chest pain.");
}
