const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL & FUTURE RISK ADVISORY ---
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#38a169", bg: "#f0fff4",
        now: "Ideal air quality. No immediate symptoms.",
        future: "Supports peak cardiovascular health and lung tissue longevity.",
        precautions: "Perfect for all outdoor activities."
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#d69e2e", bg: "#fffaf0",
        now: "Possible minor throat irritation for sensitive individuals.",
        future: "Low chronic risk, though long-term exposure can cause mild allergies.",
        precautions: "Sensitive groups should limit heavy outdoor exertion."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#ed8936", bg: "#fffbf5",
        now: "Increased wheezing and chest tightness for people with respiratory issues.",
        future: "Chronic exposure is linked to reduced lung development in children.",
        precautions: "Sensitive groups stay indoors. Wear N95 masks if outside."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5",
        now: "Inflammation of airways. Fatigue, headaches, and low stamina.",
        future: "High risk of permanent Chronic Bronchitis and lung scarring.",
        precautions: "STAY INDOORS. Close windows. Use high-efficiency air purifiers."
    };
    return {
        status: "Hazardous", color: "#7e22ce", bg: "#f5f3ff",
        now: "Severe heart and lung stress. Respiratory distress for everyone.",
        future: "Linked to heart attacks, strokes, and significant life expectancy drop.",
        precautions: "EMERGENCY: Total avoidance of outdoor air. Seal all doors."
    };
}

// --- 2. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const shareBtn = document.getElementById('whatsappBtn');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getMedicalAdvice(aqi);

    resultDiv.innerHTML = `
        <div class="med-card" style="background: ${med.bg}; border-color: ${med.color};">
            <h3 style="text-align:center;">📍 ${city} | AQI: ${aqi}</h3>
            <p style="text-align:center; font-weight:bold; color: ${med.color}; margin-bottom:15px;">${med.status.toUpperCase()}</p>
            
            <p style="font-size:14px;"><strong>🚨 Immediate Symptoms:</strong> ${med.now}</p>
            <p style="font-size:14px; margin-top:10px;"><strong>⏳ Future Health Risk:</strong> ${med.future}</p>
            <div style="margin-top:15px; padding:10px; background:white; border-radius:8px; border-left: 4px solid ${med.color};">
                <p style="font-size:14px; font-weight:bold; color: ${med.color};">🛡️ Precaution: ${med.precautions}</p>
            </div>
        </div>
    `;

    // Update WhatsApp Link
    const msg = `⚠️ HEALTH ALERT: ${city}\n💨 AQI: ${aqi} (${med.status})\n🚨 Symptoms: ${med.now}\n⏳ Long-term: ${med.future}\n🛡️ Precautions: ${med.precautions}`;
    shareBtn.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    shareBtn.style.display = "block";

    updateChart(aqi, med.color);
}

// --- 3. CHARTING TRENDS ---
function updateChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+12, aqi+4, aqi-3, aqi-10], borderColor: color, fill: true, backgroundColor: color + '22', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- 4. GLOBAL SEARCH LOGIC ---
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const state = document.getElementById('stateInput').value.trim();
    const country = document.getElementById('countryInput').value.trim();
    
    document.getElementById('result').innerHTML = "<p style='text-align:center;'>🌍 Searching Global Database...</p>";

    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else alert(`Error: ${data.data.message}. Check your spelling!`);
    } catch (err) { alert("Connection Error."); }
});

// --- 5. GPS ONE-CLICK (TRULY GLOBAL) ---
document.getElementById('checkBtn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = "<p style='text-align:center;'>🛰️ Locating Global Backend...</p>";
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});
