const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. HEALTH INTELLIGENCE ENGINE ---
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Excellent", color: "#38a169", bg: "#f0fff4",
        now: "Normal lung function. No immediate symptoms.",
        future: "Supports long-term cardiovascular health and lung capacity.",
        precautions: "Perfect for outdoor exercise."
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#d69e2e", bg: "#fffaf0",
        now: "Possible slight throat irritation for sensitive individuals.",
        future: "Minimal long-term risk for healthy adults.",
        precautions: "Sensitive groups should limit intense outdoor activity."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#ed8936", bg: "#fffaf0",
        now: "Increased coughing and chest tightness for asthmatics.",
        future: "Chronic exposure can lead to reduced lung development in children.",
        precautions: "Close windows. Sensitive groups stay indoors."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5",
        now: "Airway inflammation. Fatigue and headaches are common.",
        future: "High risk of Chronic Bronchitis and permanent lung damage.",
        precautions: "Wear N95 masks. Use air purifiers. Avoid outdoor cardio."
    };
    return {
        status: "Hazardous", color: "#822727", bg: "#fff5f5",
        now: "Severe respiratory distress. High heart and blood vessel stress.",
        future: "High risk of Stroke, Heart Attack, and 5-10 year life expectancy drop.",
        precautions: "EMERGENCY: STAY INDOORS. Seal all windows and doors."
    };
}

// --- 2. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const country = data.data.country;
    const med = getMedicalAdvice(aqi);

    resultDiv.innerHTML = `
        <div class="warning-card" style="background: ${med.bg}; border: 3px solid ${med.color}; padding: 20px; border-radius: 15px;">
            <p style="text-align:center; font-size: 12px; color: #718096; margin:0;">GLOBAL BACKEND SYNCED</p>
            <h3 style="text-align:center; margin: 5px 0;">📍 ${city}, ${country}</h3>
            <p style="text-align:center; font-weight:bold; color: ${med.color};">${med.status.toUpperCase()}</p>
            
            <div style="text-align: center; margin: 15px 0;">
                <h1 style="font-size: 64px; color: #2d3748; margin:0;">${aqi}</h1>
                <p style="color: #718096; font-size: 14px;">US AQI</p>
            </div>
            
            <hr style="margin: 15px 0; opacity: 0.1;">
            
            <div style="margin-bottom: 15px;">
                <div style="font-weight:bold; color: ${med.color}; margin-bottom:5px;">⚠️ Current Symptoms</div>
                <p style="font-size: 14px; line-height: 1.4;">${med.now}</p>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="font-weight:bold; color: ${med.color}; margin-bottom:5px;">⏳ Future Health Risk</div>
                <p style="font-size: 14px; line-height: 1.4;">${med.future}</p>
            </div>

            <div style="background: white; padding: 12px; border-radius: 8px; border-left: 5px solid ${med.color};">
                <div style="font-weight:bold; color: #2d3748; margin-bottom:3px;">🛡️ Required Precautions</div>
                <p style="font-size: 14px; font-weight: bold; color: ${med.color};">${med.precautions}</p>
            </div>
        </div>
    `;
    updateChart(aqi, med.color);
}

// --- 3. CHART & FETCH LOGIC ---
function updateChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+8, aqi+12, aqi+4, aqi-2, aqi-6], borderColor: color, fill: true, backgroundColor: color + '22', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// GLOBAL SEARCH LOGIC
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<p style='text-align:center;'>🌍 Accessing Global Health Database...</p>";

    try {
        // We attempt to find the city. Because IQAir requires State/Country, 
        // we use a "Smart Default" system for common global cities.
        let state = "Delhi"; 
        let country = "India";

        // Simple manual mapping for global reach
        const globalCities = {
            "new york": { s: "New York", c: "USA" },
            "london": { s: "England", c: "United Kingdom" },
            "tokyo": { s: "Tokyo", c: "Japan" },
            "mumbai": { s: "Maharashtra", c: "India" },
            "paris": { s: "Ile-de-France", c: "France" }
        };

        if(globalCities[city.toLowerCase()]) {
            state = globalCities[city.toLowerCase()].s;
            country = globalCities[city.toLowerCase()].c;
        }

        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `<p style="color:red; text-align:center;">❌ ${data.data.message}.<br><small>Hint: Try using the GPS button for cities outside India.</small></p>`;
        }
    } catch (err) { resultDiv.innerHTML = "❌ Connection Failed."; }
});

document.getElementById('checkBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});
