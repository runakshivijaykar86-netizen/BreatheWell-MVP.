const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL & FUTURE RISK ENGINE ---
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#38a169", bg: "#f0fff4",
        now: "Ideal air. No immediate symptoms for anyone.",
        future: "Supports long-term lung elasticity and heart health.",
        precautions: "Perfect for outdoor exercise. Keep windows open."
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#d69e2e", bg: "#fffaf0",
        now: "Sensitive individuals may feel slight throat irritation.",
        future: "Low chronic risk, though children may develop minor sensitivities.",
        precautions: "Sensitive groups should limit heavy outdoor exertion."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#ed8936", bg: "#fffbf5",
        now: "Increased risk of wheezing and chest tightness for asthmatics.",
        future: "Sustained exposure linked to reduced lung development in youth.",
        precautions: "Sensitive groups stay indoors. Use N95 masks if outside."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5",
        now: "Inflammation of the airways. Fatigue and headaches are common.",
        future: "High risk of permanent Chronic Bronchitis and lung scarring.",
        precautions: "STAY INDOORS. Close windows. Use air purifiers."
    };
    return {
        status: "Hazardous", color: "#7e22ce", bg: "#f5f3ff",
        now: "Severe heart/lung stress. Significant respiratory distress.",
        future: "Linked to heart attacks, strokes, and 5-10 year life expectancy drop.",
        precautions: "EMERGENCY: Total avoidance of outdoor air. Seal all doors."
    };
}

// --- 2. GLOBAL SEARCH & GPS LOGIC ---
async function fetchGlobalData(city, state, country) {
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "success") updateUI(data);
    else alert(`Error: ${data.data.message}. Ensure State/Country names are accurate!`);
}

// --- 3. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getMedicalAdvice(aqi);

    resultDiv.innerHTML = `
        <div class="med-card" style="background: ${med.bg}; border-left: 10px solid ${med.color}; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h3 style="text-align:center; color: #2d3748;">📍 ${city} | AQI: ${aqi}</h3>
            <p style="text-align:center; font-weight:bold; color: ${med.color};">${med.status.toUpperCase()}</p>
            <hr style="margin: 15px 0; opacity: 0.1;">
            <p style="font-size:14px; margin-bottom: 8px;"><strong>🚨 Current Symptoms:</strong> ${med.now}</p>
            <p style="font-size:14px; margin-bottom: 8px;"><strong>⏳ Future Medical Risk:</strong> ${med.future}</p>
            <p style="font-size:14px; color: #c53030; font-weight: bold;"><strong>🛡️ Required Precaution:</strong> ${med.precautions}</p>
        </div>
    `;

    // Update WhatsApp Share Link
    const msg = `⚠️ HEALTH ALERT: ${city}\n💨 AQI: ${aqi} (${med.status})\n🚨 Symptoms: ${med.now}\n🛡️ Precaution: ${med.precautions}\n\nCheck live: ${window.location.href}`;
    whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    whatsappBtn.style.display = "block";

    updateChart(aqi, med.color);
}

// --- 4. CHART & EVENT LISTENERS ---
function updateChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+10, aqi+3, aqi-4, aqi-8], borderColor: color, tension: 0.4 }]
        }
    });
}

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const state = document.getElementById('stateInput').value.trim();
    const country = document.getElementById('countryInput').value.trim();
    fetchGlobalData(city, state, country);
});

document.getElementById('checkBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});
