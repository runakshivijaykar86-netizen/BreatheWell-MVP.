const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL INTELLIGENCE ENGINE ---
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#38a169", bg: "#f0fff4",
        now: "Ideal air quality. Normal lung function observed.",
        future: "Supports maximum lung capacity and cardiovascular tissue health.",
        precautions: "Perfect for outdoor exercise. Keep indoor air ventilated."
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#d69e2e", bg: "#fffaf0",
        now: "Minor respiratory irritation possible for sensitive individuals.",
        future: "Low long-term risk for most healthy adults.",
        precautions: "Sensitive groups should monitor symptoms and limit heavy exertion."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#ed8936", bg: "#fffaf0",
        now: "Increased risk of wheezing, coughing, and chest tightness.",
        future: "Chronic exposure linked to permanent decline in lung function over time.",
        precautions: "Use N95 masks. Sensitive individuals should remain indoors."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5",
        now: "Generalized airway inflammation. Fatigue and headaches likely.",
        future: "High risk of developing Chronic Bronchitis and lung scarring.",
        precautions: "Avoid outdoor exercise. Use air purifiers and seal windows shut."
    };
    return {
        status: "Hazardous", color: "#7e22ce", bg: "#f5f3ff",
        now: "Emergency heart/lung stress. Severe respiratory distress risk.",
        future: "Strongly linked to Heart Attack, Stroke, and 5-10 year life expectancy loss.",
        precautions: "TOTAL ISOLATION: Avoid outdoor air completely. Seal all entry points."
    };
}

// --- 2. THE GLOBAL FETCH LOGIC ---
async function fetchGlobalData(city, state, country) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<p style='text-align:center;'>🌍 Accessing Global Health Database...</p>";
    
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `
                <div style="color:red; text-align:center; padding:15px; border:1px solid red; border-radius:8px; background: #fff5f5;">
                    ❌ <strong>${data.data.message}</strong><br>
                    <small>Tip: For global cities, use the full state/region name (e.g. 'Maharashtra' instead of 'MH').</small>
                </div>`;
        }
    } catch (err) {
        resultDiv.innerHTML = "❌ Connection Failed. Check your internet.";
    }
}

// --- 3. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const shareBtn = document.getElementById('whatsappBtn');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getMedicalAdvice(aqi);

    resultDiv.innerHTML = `
        <div class="med-card" style="background: ${med.bg}; border-color: ${med.color};">
            <h3 style="text-align:center; color: #2d3748;">📍 ${city} | AQI: ${aqi}</h3>
            <p style="text-align:center; font-weight:bold; color: ${med.color}; margin-bottom:15px; letter-spacing: 1px;">${med.status.toUpperCase()}</p>
            
            <div class="health-item">
                <span class="health-label" style="color: ${med.color};">⚠️ Current Impact</span>
                <p style="font-size:14px;">${med.now}</p>
            </div>

            <div class="health-item">
                <span class="health-label" style="color: ${med.color};">⏳ Future Chronic Risk</span>
                <p style="font-size:14px;">${med.future}</p>
            </div>

            <div class="health-item" style="margin-top:20px; padding:12px; background:white; border-radius:8px; border-left: 4px solid ${med.color};">
                <span class="health-label" style="color: #2d3748;">🛡️ Required Precaution</span>
                <p style="font-size:14px; font-weight: bold; color: ${med.color};">${med.precautions}</p>
            </div>
        </div>
    `;

    // WhatsApp Message Logic
    const msg = `💨 HEALTH ALERT: ${city}\nAQI: ${aqi} (${med.status})\n🚨 Symptoms: ${med.now}\n⏳ Long-term: ${med.future}\n🛡️ Precautions: ${med.precautions}\n\nCheck live: ${window.location.href}`;
    shareBtn.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    shareBtn.style.display = "block";

    updateChart(aqi, med.color);
}

// --- 4. DATA VISUALIZATION (Chart.js) ---
function updateChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{ label: 'Predicted Trend', data: [aqi, aqi+5, aqi+15, aqi+8, aqi-2, aqi-10], borderColor: color, fill: true, backgroundColor: color + '11', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { display: true }, x: { display: true } } }
    });
}

// --- 5. EVENT LISTENERS & SHORTCUTS ---
function quickSearch(city, state, country) {
    document.getElementById('cityInput').value = city;
    document.getElementById('stateInput').value = state;
    document.getElementById('countryInput').value = country;
    fetchGlobalData(city, state, country);
}

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const state = document.getElementById('stateInput').value.trim();
    const country = document.getElementById('countryInput').value.trim();
    fetchGlobalData(city, state, country);
});

document.getElementById('checkBtn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = "<p style='text-align:center;'>🛰️ Syncing with Global Satellite Data...</p>";
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`);
            const data = await res.json();
            if (data.status === "success") updateUI(data);
        } catch (err) { alert("GPS Sync Failed."); }
    });
});
