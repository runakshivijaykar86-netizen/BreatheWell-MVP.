console.log("BreatheWell System Online");
const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';

// --- 1. LOGIC: FUTURE HEALTH OUTLOOK ---
function getFutureRisk(aqi) {
    if (aqi > 150) return "🔴 **Critical Risk:** Sustained exposure level. Immediate indoor transition advised.";
    if (aqi > 100) return "🟡 **Moderate Risk:** Cumulative exposure risk. Suggesting air filtration.";
    return "🟢 **Healthy Horizon:** Current levels support optimal lung health.";
}

// --- 2. UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    if (!data || !data.data) return;

    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="card" style="border: 2px solid #667eea; border-radius: 20px; padding: 25px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="text-align:center; color: #2d3748; margin-top:0;">📍 ${city}</h2>
            <div style="text-align:center; margin: 20px 0;">
                <span style="font-size: 80px; font-weight: bold; color: ${aqi > 100 ? '#e53e3e' : '#38a169'}">${aqi}</span>
                <p style="font-size: 20px; color: #718096; margin:0;">US AQI</p>
            </div>
            <div style="background: #fff5f5; border-left: 5px solid #e53e3e; padding: 15px; margin-bottom: 15px; border-radius: 0 10px 10px 0;">
                <h4 style="margin:0; color: #c53030;">📅 Future Health Outlook</h4>
                <p style="margin: 5px 0 0 0; font-size: 14px; line-height:1.4;">${getFutureRisk(aqi)}</p>
            </div>
        </div>
    `;
}

// --- 3. SEARCH BY CITY ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value;
    const resultDiv = document.getElementById('result');
    if(!city) return alert("Please type a city!");

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = "<p style='text-align:center;'>🔍 Fetching Data from Backend API...</p>";

    try {
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Delhi&country=India&key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        if(data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `<p style="color:red; text-align:center;">❌ API Error: ${data.data.message}</p>`;
        }
    } catch (error) {
        console.error("Connection Error:", error);
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">❌ Connection Error: ${error.message}<br>Please check your internet or Ad-blocker.</p>`;
    }
});

// --- 4. GPS LOCATION ---
document.getElementById('checkBtn')?.addEventListener('click', () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<p style='text-align:center;'>🛰️ Requesting GPS...</p>";
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if(data.status === "success") updateUI(data);
        } catch (err) {
            resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ API Connection Failed.</p>";
        }
    }, (err) => {
        resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ GPS Denied.</p>";
    });
});
