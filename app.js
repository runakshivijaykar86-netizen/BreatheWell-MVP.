const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let currentAQIData = null;

// --- 1. THE LOGIC ENGINE (Functions you already wrote) ---

function getHealthWarnings(aqi) {
    if (aqi <= 50) return '<p>Air quality is good. No health concerns.</p>';
    if (aqi <= 100) return '<p>Acceptable. Sensitive groups should limit outdoor time.</p>';
    if (aqi <= 150) return '<p><strong>Warning:</strong> Children/elderly may feel discomfort.</p>';
    if (aqi <= 200) return '<p><strong>Everyone:</strong> Throat and eye irritation common.</p>';
    return '<p><strong>HEALTH ALERT:</strong> Serious risk to everyone. Stay indoors.</p>';
}

function getRecommendations(aqi) {
    if (aqi <= 50) return '<ul><li>Enjoy outdoor activities!</li></ul>';
    if (aqi <= 150) return '<ul><li>Wear an N95 mask outside.</li><li>Use air purifiers.</li></ul>';
    return '<ul><li><strong>STAY INDOORS</strong>.</li><li>Seal windows and doors.</li></ul>';
}

function getConsequences(aqi) {
    if (aqi <= 100) return '<p>No immediate consequences.</p>';
    if (aqi <= 200) return '<ul><li>Increased risk of asthma.</li><li>Permanent lung damage.</li></ul>';
    return '<ul><li>Life-threatening outcomes.</li><li>Irreversible heart damage.</li></ul>';
}

// --- 2. THE UI UPDATER (Reusable for GPS or Search) ---

function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const country = data.data.country;

    currentAQIData = { aqi, city, country };

    let aqiLevel = "Good";
    let color = "#00e400";

    if (aqi > 50) { aqiLevel = 'Moderate'; color = '#ffff00'; }
    if (aqi > 100) { aqiLevel = 'Unhealthy (Sens)'; color = '#ff7e00'; }
    if (aqi > 150) { aqiLevel = 'Unhealthy'; color = '#ff0000'; }
    if (aqi > 200) { aqiLevel = 'Very Unhealthy'; color = '#8f3f97'; }
    if (aqi > 300) { aqiLevel = 'Hazardous'; color = '#7e0023'; }

    resultDiv.innerHTML = `
        <h2 style="text-align: center;">📍 ${city}, ${country}</h2>
        <div style="background: ${color}; padding: 30px; border-radius: 15px; color: ${aqi <= 100 ? 'black' : 'white'}; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 64px;">${aqi}</h1>
            <p style="font-size: 24px; font-weight: 600;">${aqiLevel.toUpperCase()}</p>
        </div>
        
        <div class="info-card warning-card"><h3>⚠️ Health Warnings</h3>${getHealthWarnings(aqi)}</div>
        <div class="info-card action-card"><h3>✅ What To Do</h3>${getRecommendations(aqi)}</div>
        <div class="info-card danger-card"><h3>❌ Future Risks</h3>${getConsequences(aqi)}</div>
    `;
    resultDiv.style.display = 'block';
}

// --- 3. EVENT LISTENERS ---

// GPS Button
document.getElementById('checkBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        document.getElementById('result').innerHTML = "🔍 Getting location...";
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${API_KEY}`)
                .then(res => res.json())
                .then(data => updateUI(data));
        });
    }
});

// Search Button
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value;
    if (!city) return alert("Enter city!");
    
    // Using a simple API format: Note - IQAir needs state/country for specific city searches.
    // For now, we search within a default (like India) to keep it simple for your MVP.
    fetch(`https://api.airvisual.com/v2/city?city=${city}&state=Delhi&country=India&key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") updateUI(data);
            else alert("City not found! Try 'Delhi' or 'Mumbai'.");
        });
});