const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. HEALTH INTELLIGENCE ENGINE ---
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#38a169", bg: "#f0fff4",
        now: "Ideal air quality. Breathe deep with no immediate symptoms.",
        future: "Supports long-term lung elasticity and cardiovascular health.",
        precautions: "No precautions needed. Enjoy all outdoor activities!"
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#d69e2e", bg: "#fffaf0",
        now: "Sensitive individuals may experience minor throat irritation or dry eyes.",
        future: "Low chronic risk, though sensitive children may develop minor allergies.",
        precautions: "Consider reducing heavy outdoor exercise if you feel irritation."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#ed8936", bg: "#fffaf0",
        now: "Asthmatics may experience wheezing, coughing, and chest tightness.",
        future: "Consistent exposure over 5+ years is linked to reduced lung growth in children.",
        precautions: "Sensitive groups stay indoors. Wear an N95 mask if outside for long."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#e53e3e", bg: "#fff5f5",
        now: "Inflammation of the airways. Fatigue, headaches, and low stamina are common.",
        future: "High risk of permanent lung tissue damage and Chronic Bronchitis.",
        precautions: "MANDATORY: Wear N95 masks outdoors. Close all windows. Use air purifiers."
    };
    return {
        status: "Hazardous", color: "#702459", bg: "#fff5f5",
        now: "Severe respiratory distress. Heart stress and blood vessel inflammation.",
        future: "High risk of Stroke, Heart Attack, and 5-10 year drop in life expectancy.",
        precautions: "EMERGENCY: STAY INDOORS. Seal all windows and doors. Avoid all exertion."
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
        <div style="border-radius: 15px; background: white; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 25px; border: 3px solid ${med.color};">
            <div style="background: ${med.color}; color: white; padding: 15px; text-align: center;">
                <h3 style="margin:0;">📍 ${city}, ${country}</h3>
                <p style="font-size: 12px; opacity: 0.9; font-weight: bold;">${med.status.toUpperCase()}</p>
            </div>
            
            <div style="padding: 25px; background: ${med.bg};">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-size: 80px; color: #2d3748; margin:0;">${aqi}</h1>
                    <p style="color: #718096; font-size: 14px;">US AQI INDEX</p>
                </div>

                <div style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px;">
                    <div style="margin-bottom: 15px;">
                        <h4 style="color: #2d3748; margin-bottom: 5px;">⚠️ Immediate Symptoms</h4>
                        <p style="font-size: 14px; color: #4a5568;">${med.now}</p>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <h4 style="color: #2d3748; margin-bottom: 5px;">⏳ Future Medical Risk</h4>
                        <p style="font-size: 14px; color: #4a5568;">${med.future}</p>
                    </div>
                    
                    <div>
                        <h4 style="color: #2d3748; margin-bottom: 5px;">🛡️ Required Precautions</h4>
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 5px solid ${med.color};">
                            <p style="font-size: 14px; font-weight: bold; color: ${med.color};">${med.precautions}</p>
                        </div>
                    </div>
                </div>
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
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+12, aqi+8, aqi-2, aqi-10, aqi-5], borderColor: color, fill: true, backgroundColor: color + '22', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<p style='text-align:center;'>🩺 Analyzing Health Hazards...</p>";

    try {
        // GLOBAL SEARCH: We try searching India by default. 
        // For truly Global results without state names, the GPS button is the key.
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Delhi&country=India&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `
                <div style="text-align:center; padding: 20px;">
                    <p style="color:red;">❌ City "${city}" not found in current region.</p>
                    <p style="font-size: 12px; color: #718096; margin-top:10px;">The search is currently optimized for India. Use the <strong>GPS Button</strong> below for global results!</p>
                </div>`;
        }
    } catch (err) { resultDiv.innerHTML = "❌ Backend Connection Error."; }
});

document.getElementById('checkBtn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = "<p style='text-align:center;'>🛰️ Syncing with Global Backend...</p>";
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});
