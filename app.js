// --- CONFIGURATION ---
const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
console.log("BreatheWell System Online - V4 Global");

// --- UI UPDATER: SMART DASHBOARD ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const temp = data.data.current.weather.tp;
    const humidity = data.data.current.weather.hu;

    // Determine Health Status and Colors
    let color = "#38a169"; // Green
    let status = "GOOD";
    let advice = "Great day for outdoor activities!";

    if (aqi > 50) { color = "#d69e2e"; status = "MODERATE"; advice = "Sensitive groups should reduce outdoor exercise."; }
    if (aqi > 100) { color = "#e53e3e"; status = "UNHEALTHY"; advice = "Wear a mask. Avoid prolonged outdoor exertion."; }
    if (aqi > 200) { color = "#805ad5"; status = "VERY UNHEALTHY"; advice = "Stay indoors. Keep windows closed."; }

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="border-top: 8px solid ${color}; padding: 20px; border-radius: 12px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <p style="color: #718096; font-size: 14px; text-align: center;">CURRENT LOCATION</p>
            <h3 style="text-align: center; font-size: 24px; color: #2d3748; margin-bottom: 15px;">📍 ${city}</h3>
            
            <div style="text-align: center; margin: 20px 0;">
                <div style="display: inline-block; background: ${color}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-bottom: 10px;">
                    ${status}
                </div>
                <h1 style="font-size: 72px; color: #2d3748; line-height: 1;">${aqi}</h1>
                <p style="color: #a0aec0; letter-spacing: 2px; font-size: 14px;">US AQI</p>
            </div>

            <div style="display: flex; justify-content: space-around; border-top: 1px solid #edf2f7; padding-top: 15px; margin-top: 15px;">
                <div style="text-align:center;">
                    <p style="color: #718096; font-size: 12px;">TEMP</p>
                    <p style="font-weight: bold;">${temp}°C</p>
                </div>
                <div style="text-align:center;">
                    <p style="color: #718096; font-size: 12px;">HUMIDITY</p>
                    <p style="font-weight: bold;">${humidity}%</p>
                </div>
            </div>

            <div style="background: #f7fafc; padding: 12px; border-radius: 8px; margin-top: 15px;">
                <p style="font-size: 13px; color: #4a5568; line-height: 1.4;"><strong>Health Advice:</strong> ${advice}</p>
            </div>
        </div>
    `;
}

// --- SEARCH EVENT (GLOBAL REDIRECT) ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML = "<p class='loading'>🔍 Searching Global Air Database...</p>";

    try {
        // This URL attempts to find the city in India specifically. 
        // For truly world-wide search, you would eventually need a state/country dropdown.
        const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(city)}&country=India&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if(data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `<p style="color:red; text-align:center;">❌ Could not find data for "${city}" in India. Try 'Delhi' or 'Mumbai'.</p>`;
        }
    } catch (err) {
        resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ Connection failed. Check your internet.</p>";
    }
});

// --- GPS EVENT ---
document.getElementById('checkBtn')?.addEventListener('click', () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<p class='loading'>🛰️ Fetching local data from Backend...</p>";
    
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
        resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ GPS Access Denied.</p>";
    });
});
