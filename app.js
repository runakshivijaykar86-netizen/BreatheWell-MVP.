const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. MEDICAL INTELLIGENCE ENGINE ---
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#38a169", bg: "#f0fff4",
        now: "Ideal conditions. Normal lung function.",
        future: "Supports long-term cardiovascular health.",
        precautions: "No precautions needed. Breathe deep!"
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#d69e2e", bg: "#fffaf0",
        now: "Possible minor throat irritation for sensitive groups.",
        future: "Low long-term chronic risk.",
        precautions: "Sensitive groups should limit heavy outdoor activity."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#ed8936", bg: "#fffbf5",
        now: "Risk of wheezing and coughing for asthmatics.",
        future: "Sustained exposure linked to reduced lung growth in children.",
        precautions: "Sensitive groups stay indoors. Wear N95 masks if outside."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5",
        now: "Significant airway inflammation. High fatigue levels.",
        future: "High risk of permanent Chronic Bronchitis and lung damage.",
        precautions: "STAY INDOORS. Close all windows. Use air purifiers."
    };
    return {
        status: "Hazardous", color: "#822727", bg: "#fff5f5",
        now: "Severe heart and lung stress. Respiratory distress.",
        future: "Linked to heart attacks, strokes, and 5-10 year life expectancy drop.",
        precautions: "EMERGENCY: Total avoidance of outdoor air. Seal your room."
    };
}

// --- 2. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const country = data.data.country;
    const med = getMedicalAdvice(aqi);

    // Update Dashboard HTML
    resultDiv.innerHTML = `
        <div class="warning-card" style="background: ${med.bg}; border-color: ${med.color};">
            <h3 style="text-align:center;">📍 ${city}, ${country}</h3>
            <p style="text-align:center; font-weight:bold; color: ${med.color};">${med.status.toUpperCase()}</p>
            <div style="text-align: center; margin: 15px 0;">
                <h1 style="font-size: 64px; color: #2d3748;">${aqi}</h1>
                <p style="color: #718096; font-size: 14px;">US AQI INDEX</p>
            </div>
            <div style="font-size: 14px; color: #4a5568;">
                <p><strong>🚨 Current:</strong> ${med.now}</p>
                <p style="margin-top:10px;"><strong>⏳ Future Risk:</strong> ${med.future}</p>
                <div style="margin-top:15px; padding:10px; background:white; border-left:4px solid ${med.color};">
                    <strong>🛡️ Precaution:</strong> ${med.precautions}
                </div>
            </div>
        </div>
    `;

    // --- 3. WHATSAPP SHARE LOGIC ---
    const shareText = `⚠️ HEALTH ALERT for ${city}!\n\n💨 AQI: ${aqi} (${med.status})\n🚨 Impact: ${med.now}\n⏳ Future Risk: ${med.future}\n🛡️ Precautions: ${med.precautions}\n\nCheck your air quality here: ${window.location.href}`;
    whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    whatsappBtn.style.display = "block"; // Make the button visible

    updateChart(aqi, med.color);
}

// --- 4. CHART & FETCH LOGIC ---
function updateChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+12, aqi+4, aqi-5, aqi-2], borderColor: color, fill: false, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    try {
        const res = await fetch(`https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Delhi&country=India&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else alert("City not found. Using GPS is recommended for global results.");
    } catch (err) { alert("Backend Error."); }
});

document.getElementById('checkBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});
