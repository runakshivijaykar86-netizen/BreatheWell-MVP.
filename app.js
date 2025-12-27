// --- 1. CONFIGURATION ---
const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
console.log("BreatheWell System Online - Backend Connected");

// --- 2. UI UPDATER: DRAWS THE DATA ON SCREEN ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) return;

    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="border: 2px solid #0078d4; padding: 25px; border-radius: 20px; text-align: center; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #4a5568;">📍 ${city}</h3>
            <h1 style="font-size: 70px; margin: 10px 0; color: ${aqi > 100 ? '#e53e3e' : '#38a169'};">${aqi}</h1>
            <p style="font-weight: bold; color: #718096;">US AQI INDEX</p>
            <div style="margin-top: 15px; padding: 10px; border-radius: 10px; background: ${aqi > 100 ? '#fff5f5' : '#f0fff4'};">
                <p style="color: ${aqi > 100 ? '#c53030' : '#2f855a'}; font-weight: bold;">
                    Status: ${aqi > 100 ? '🔴 Unhealthy' : '🟢 Healthy'}
                </p>
            </div>
        </div>
    `;
}

// --- 3. SEARCH BY CITY (No more 405 error) ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // This is the secret to stopping the 405 error
    
    const cityInput = document.getElementById('cityInput');
    const resultDiv = document.getElementById('result');
    const city = cityInput.value.trim();

    if(!city) return alert("Please type a city!");

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = "<p style='text-align:center;'>🔍 Fetching from AirVisual Backend...</p>";

    try {
        // We use the specific city data from the AirVisual API
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Delhi&country=India&key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        if(data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `<p style="color:red; text-align:center;">❌ Error: ${data.data.message}. Try 'Delhi'.</p>`;
        }
    } catch (err) {
        console.error("Connection Failed:", err);
        resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ Connection Failed. Ensure Ad-blockers are OFF.</p>";
    }
});

// --- 4. GPS LOCATION ---
document.getElementById('checkBtn')?.addEventListener('click', () => {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = "<p style='text-align:center;'>🛰️ Syncing with GPS Backend...</p>";

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if(data.status === "success") updateUI(data);
        } catch (err) {
            resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ Connection Failed.</p>";
        }
    }, (err) => {
        resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ GPS Denied.</p>";
    });
});
