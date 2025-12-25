const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';

// Helper functions for content
const getWarnings = (aqi) => aqi > 100 ? "⚠️ High Risk: Wear a mask." : "✅ Low Risk: Safe to breathe.";
const getAI = (aqi) => aqi > 100 ? "Azure AI: Pollution spike detected. Reschedule outdoor tasks." : "Azure AI: Air is stable. No action needed.";

async function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    
    resultDiv.innerHTML = `
        <div class="aqi-card" style="text-align:center; border: 2px solid #667eea; padding: 20px; border-radius: 15px;">
            <h2>📍 ${city}</h2>
            <h1 style="font-size: 50px; color: ${aqi > 100 ? 'red' : 'green'}">${aqi} AQI</h1>
            <div class="info-card warning-card"><h3>Health Warning</h3><p>${getWarnings(aqi)}</p></div>
            <div class="info-card" style="background:#f0f4ff; margin-top:10px; padding:10px;">
                <h3>🤖 Azure AI Insight</h3>
                <p>${getAI(aqi)}</p>
            </div>
        </div>
    `;
}

document.getElementById('checkBtn').addEventListener('click', function() {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>🔄 Step 1: Requesting GPS...</p>';

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            resultDiv.innerHTML = '<p>🔄 Step 2: GPS Found. Calling API...</p>';
            try {
                const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
                const res = await fetch(url);
                const data = await res.json();
                
                if(data.status === "success") {
                    updateUI(data);
                } else {
                    resultDiv.innerHTML = `<p>❌ API Error: ${data.data.message}</p>`;
                }
            } catch (e) {
                resultDiv.innerHTML = '<p>❌ Connection Error. Is your internet okay?</p>';
            }
        },
        (err) => {
            resultDiv.innerHTML = `<p>❌ GPS Blocked. Error Code: ${err.code}. <br>Please allow location in your browser bar.</p>`;
        },
        { timeout: 10000 }
    );
});

document.getElementById('searchBtn').addEventListener('click', async function() {
    const city = document.getElementById('cityInput').value;
    const resultDiv = document.getElementById('result');
    if(!city) return alert("Type a city name!");

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p>🔍 Searching for ${city}...</p>`;

    try {
        // We use a general search for India cities as a fallback
        const url = `https://api.airvisual.com/v2/city?city=${city}&state=Delhi&country=India&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if(data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `<p>❌ City not found. Try "Delhi" or "Mumbai".</p>`;
        }
    } catch (e) {
        resultDiv.innerHTML = '<p>❌ Search failed.</p>';
    }
});
