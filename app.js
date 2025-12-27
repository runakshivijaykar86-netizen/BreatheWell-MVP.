const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. HEALTH INTELLIGENCE ENGINE ---
function getHealthAdvice(aqi) {
    if (aqi <= 50) {
        return {
            now: "Air quality is ideal. Breathe deep!",
            future: "Consistent exposure to this level maintains optimal lung elasticity and cardiovascular health.",
            precautions: "No precautions needed. Enjoy outdoor activities.",
            color: "#38a169", status: "Healthy"
        };
    } else if (aqi <= 100) {
        return {
            now: "Acceptable quality, but sensitive individuals may feel slight irritation.",
            future: "Long-term exposure can lead to minor respiratory sensitivity in children and the elderly.",
            precautions: "Sensitive groups should reduce heavy outdoor exertion.",
            color: "#d69e2e", status: "Moderate"
        };
    } else if (aqi <= 150) {
        return {
            now: "Increased risk of wheezing and chest tightness for those with asthma.",
            future: "Chronic exposure is linked to a decline in lung function over 5-10 years.",
            precautions: "Wear a mask (N95) if outdoors for more than 30 minutes. Close windows.",
            color: "#ed8936", status: "Unhealthy for Sensitive Groups"
        };
    } else {
        return {
            now: "High risk of respiratory inflammation and heart stress for everyone.",
            future: "Severe risk of developing chronic bronchitis or reduced life expectancy if levels persist.",
            precautions: "STAY INDOORS. Use air purifiers. Total avoidance of outdoor exercise.",
            color: "#e53e3e", status: "Hazardous"
        };
    }
}

// --- 2. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const advice = getHealthAdvice(aqi);

    resultDiv.innerHTML = `
        <div style="border-radius: 15px; background: white; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <div style="background: ${advice.color}; color: white; padding: 15px; text-align: center;">
                <h3 style="margin:0;">📍 ${city}</h3>
                <p style="font-size: 12px; opacity: 0.9;">${advice.status.toUpperCase()}</p>
            </div>
            
            <div style="padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-size: 64px; color: #2d3748; margin:0;">${aqi}</h1>
                    <p style="color: #718096; font-size: 14px;">US AQI INDEX</p>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 15px;">
                    <h4 style="color: #2d3748; margin-bottom: 5px;">🚨 Immediate Impact</h4>
                    <p style="font-size: 14px; color: #4a5568; margin-bottom: 15px;">${advice.now}</p>
                    
                    <h4 style="color: #2d3748; margin-bottom: 5px;">⏳ Future Health Risk</h4>
                    <p style="font-size: 14px; color: #4a5568; margin-bottom: 15px;">${advice.future}</p>
                    
                    <h4 style="color: #2d3748; margin-bottom: 5px;">🛡️ Required Precautions</h4>
                    <div style="background: #fff5f5; padding: 10px; border-radius: 8px; border-left: 4px solid ${advice.color};">
                        <p style="font-size: 14px; font-weight: bold; color: #c53030;">${advice.precautions}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    updateChart(aqi);
}

// --- 3. CHART LOGIC (Kept for visual trend) ---
function updateChart(currentAqi) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{
                label: 'AQI Forecast',
                data: [currentAqi, currentAqi+10, currentAqi+15, currentAqi+5, currentAqi-5, currentAqi-10],
                borderColor: '#0078d4',
                backgroundColor: 'rgba(0, 120, 212, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- 4. SEARCH & GPS HANDLERS (Same as before) ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<p style='text-align:center;'>🩺 Analyzing Health Hazards...</p>";

    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Delhi&country=India&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if(data.status === "success") updateUI(data);
        else resultDiv.innerHTML = "❌ City Data Unreachable.";
    } catch (err) {
        resultDiv.innerHTML = "❌ Connection Failed.";
    }
});

document.getElementById('checkBtn')?.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.status === "success") updateUI(data);
    });
});
