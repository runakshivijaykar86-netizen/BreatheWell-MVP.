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
// --- Updated GPS Button Logic ---
document.getElementById('checkBtn').addEventListener('click', async function() {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>🔍 Getting your location...</p>';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            resultDiv.innerHTML = '<p>📍 Location found! Fetching AQI data...</p>';
            
            try {
                const response = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    // 1. Run the UI update you already have
                    updateUI(data); 
                    
                    // 2. Trigger the AI Prediction specifically
                    const aqi = data.data.current.pollution.aqius;
                    const city = data.data.city;
                    const aiText = document.getElementById('ai-prediction');
                    
                    aiText.innerText = "🤖 Azure AI is analyzing air patterns...";
                    
                    // Call the AI function we wrote earlier
                    const prediction = await getAIPrediction(aqi, city);
                    aiText.innerText = prediction;
                    
                } else {
                    resultDiv.innerHTML = '<p>❌ Could not fetch data. Try again!</p>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<p>❌ Error connecting to services.</p>';
            }
        }, function(error) {
            resultDiv.innerHTML = '<p>❌ Please allow location access to continue.</p>';
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
// --- New AI Logic Placeholder ---

async function getAIPrediction(aqi, city) {
    // In the final version, this will call the Azure AI API
    // For now, it simulates a "Thinking" delay like a real AI
    return new Promise((resolve) => {
        setTimeout(() => {
            if (aqi > 100) {
                resolve(`Azure AI Analysis: The current atmosphere in ${city} shows high particulate matter. Predicted risk for asthma patients: INCREASED. Suggesting immediate indoor transition.`);
            } else {
                resolve("Azure AI Analysis: Stable air quality detected. No significant long-term health anomalies predicted for today.");
            }
        }, 1500); // 1.5 second "thinking" delay
    });
}

// Update your updateUI function to use this:
async function updateUI(data) {
    // ... your existing code ...
    
    // Add this at the bottom:
    const aiText = document.getElementById('ai-prediction'); 
    aiText.innerText = "🤖 AI is analyzing...";
    
    const prediction = await getAIPrediction(aqi, city);
    aiText.innerText = prediction;
}

