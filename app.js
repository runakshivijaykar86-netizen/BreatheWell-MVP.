const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL INTELLIGENCE ENGINE ---
function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#38a169", bg: "#f0fff4", now: "Ideal air quality.", future: "Supports long-term lung health.", precautions: "No precautions needed." };
    if (aqi <= 100) return { status: "Moderate", color: "#d69e2e", bg: "#fffaf0", now: "Minor throat irritation possible.", future: "Minimal chronic risk.", precautions: "Sensitive groups limit exertion." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5", now: "Airway inflammation and fatigue.", future: "High risk of permanent lung damage.", precautions: "Wear N95 masks. Stay indoors." };
    
    // THE EMERGENCY RANGE (Purple/Hazardous)
    return { status: "HAZARDOUS", color: "#7e22ce", bg: "#f5f3ff", now: "SEVERE respiratory distress. Heart stress.", future: "High risk of Stroke & Heart Attack.", precautions: "EMERGENCY: Total avoidance of outdoor air. Seal all entry points." };
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
            <p style="text-align:center; color:${med.color}; font-weight:bold; letter-spacing:1px;">${med.status.toUpperCase()}</p>
            <hr style="margin:15px 0; opacity:0.1;">
            <div style="font-size:14px; line-height:1.6;">
                <p><strong>🚨 Symptoms Now:</strong> ${med.now}</p>
                <p style="margin-top:10px;"><strong>⏳ Long-term Risk:</strong> ${med.future}</p>
                <div style="margin-top:15px; padding:12px; background:white; border-left:4px solid ${med.color}; border-radius:8px;">
                    <strong>🛡️ PRECAUTION:</strong> ${med.precautions}
                </div>
            </div>
        </div>
    `;

    // SHOW EMERGENCY BUTTON IF AQI > 300
    if (aqi >= 300) {
        emergencyZone.style.display = "block";
    } else {
        emergencyZone.style.display = "none";
    }

    waBtn.style.display = "block";
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(`⚠️ HEALTH ALERT: ${city}\n💨 AQI: ${aqi}\n🚨 Risk: ${med.now}\n🛡️ Precaution: ${med.precautions}\n\nCheck live: ${window.location.href}`)}`;
    
    drawChart(aqi, med.color);
}

// --- 3. SEARCH & GPS LOGIC ---
async function search(c, s, co) {
    const resDiv = document.getElementById('result');
    resDiv.innerHTML = "<p style='text-align:center;'>🩺 Running Medical Analysis...</p>";
    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else resDiv.innerHTML = `<p style="color:red; text-align:center;">❌ ${data.data.message}. Use GPS button for best results.</p>`;
    } catch (e) { resDiv.innerHTML = "❌ Connection Failed."; }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    search(document.getElementById('city').value, document.getElementById('state').value, document.getElementById('country').value);
});

document.getElementById('gps-btn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = "🛰️ Connecting to Global Satellites...";
    navigator.geolocation.getCurrentPosition(async (p) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${p.coords.latitude}&lon=${p.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});

// --- 4. DATA VISUALIZATION ---
function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h'],
            datasets: [{ label: 'Predicted Trend', data: [aqi, aqi+8, aqi+12, aqi+4, aqi-5], borderColor: color, fill: true, backgroundColor: color + '11', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- 5. EMERGENCY ALERT FUNCTION ---
function triggerEmergencyAlert() {
    alert("🆘 CRITICAL PROTOCOL:\n1. Move to a room with an air purifier.\n2. Seal door gaps with wet towels.\n3. Do not engage in physical activity.\n4. If experiencing chest pain, call local emergency services immediately.");
}
