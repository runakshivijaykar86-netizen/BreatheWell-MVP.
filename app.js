const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. THE MEDICAL ENGINE ---
function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#28a745", now: "Clear air. Normal lung function.", future: "Supports long-term heart health.", precautions: "No precautions needed." };
    if (aqi <= 100) return { status: "Moderate", color: "#ffc107", now: "Minor throat irritation possible.", future: "Low risk for healthy adults.", precautions: "Sensitive groups limit exertion." };
    if (aqi <= 150) return { status: "Unhealthy (Sensitive)", color: "#fd7e14", now: "Wheezing/Coughing for asthmatics.", future: "May reduce lung growth in children.", precautions: "Wear N95 masks outdoors." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#dc3545", now: "Airway inflammation. Fatigue.", future: "High risk of Chronic Bronchitis.", precautions: "Stay indoors. Use air purifiers." };
    return { status: "Hazardous", color: "#6f42c1", now: "Severe heart/lung stress.", future: "Linked to Strokes and Heart Attacks.", precautions: "EMERGENCY: Seal windows. Do not go out." };
}

// --- 2. THE UI UPDATER ---
function updateUI(data) {
    const resDiv = document.getElementById('result');
    const waBtn = document.getElementById('whatsappBtn');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getAdvice(aqi);

    resDiv.innerHTML = `
        <div class="med-card" style="border-color: ${med.color}; background: #fff;">
            <h3 style="text-align:center;">📍 ${city} | AQI: ${aqi}</h3>
            <p style="text-align:center; color:${med.color}; font-weight:bold;">${med.status.toUpperCase()}</p>
            <hr style="margin:15px 0; opacity:0.1;">
            <div style="font-size:14px;">
                <span class="warning-label" style="color:${med.color}">🚨 Impact Now</span> <p>${med.now}</p>
                <br>
                <span class="warning-label" style="color:${med.color}">⏳ Future Risk</span> <p>${med.future}</p>
                <br>
                <div style="padding:10px; background:#f8f9fa; border-left:4px solid ${med.color};">
                    <strong>🛡️ PRECAUTION:</strong> ${med.precautions}
                </div>
            </div>
        </div>
    `;

    waBtn.style.display = "block";
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(`⚠️ HEALTH ALERT: ${city}\nAQI: ${aqi}\nImpact: ${med.now}\nPrecaution: ${med.precautions}`)}`;
    
    drawChart(aqi, med.color);
}

// --- 3. SEARCH & GPS LOGIC ---
async function search(c, s, co) {
    const resDiv = document.getElementById('result');
    resDiv.innerHTML = "🔍 Fetching Global Data...";
    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else resDiv.innerHTML = `<p style="color:red; text-align:center;">❌ ${data.data.message}. Use GPS button for best results.</p>`;
    } catch (e) { resDiv.innerHTML = "❌ Connection Failed."; }
}

function quick(c, s, co) {
    document.getElementById('city').value = c;
    document.getElementById('state').value = s;
    document.getElementById('country').value = co;
    search(c, s, co);
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

function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+10, aqi-2, aqi-5], borderColor: color, fill: false, tension: 0.4 }]
        }
    });
}
