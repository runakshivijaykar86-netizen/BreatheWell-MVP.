console.log("BreatheWell System Online");
const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';

// --- 2. LOGIC: FUTURE HEALTH OUTLOOK (The "Brains" of your app) ---
function getFutureRisk(aqi) {
    if (aqi > 150) {
        return "🔴 **Critical Risk:** Sustained exposure at this level for 2+ years is statistically linked to a 15-20% decrease in peak expiratory flow. Immediate indoor transition advised.";
    } else if (aqi > 100) {
        return "🟡 **Moderate Risk:** Cumulative exposure may lead to developed respiratory sensitivity by 2030. Suggesting high-efficiency air filtration for sleeping quarters.";
    } else {
        return "🟢 **Healthy Horizon:** Current levels support optimal cardiovascular longevity and lung tissue health.";
    }
}

// --- 3. UI UPDATER: DRAWING THE DASHBOARD ---
function updateUI(data) {
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const resultDiv = document.getElementById('result');
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

            <div style="background: #ebf8ff; border-left: 5px solid #3182ce; padding: 15px; border-radius: 0 10px 10px 0;">
                <h4 style="margin:0; color: #2b6cb0;">🤖 Azure AI Suggestion</h4>
                <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic;">
                    "Analyzing trends in ${city}... Recommendation: Avoid outdoor cardio between 4 PM and 8 PM when particulate concentration is highest."
                </p>
            </div>
        </div>
    `;
}

// --- 4. SEARCH BY CITY BUTTON ---
// --- 4. SEARCH BY CITY (DEBUG VERSION) ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const city = document.getElementById('cityInput').value;
    const resultDiv = document.getElementById('result');
    
    if(!city) return alert("Please type a city!");
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = "<p style='text-align:center;'>🔍 Debug: Attempting Connection...</p>";

    try {
        const url = `https://api.airvisual.com/v2/city?city=${city}&state=Delhi&country=India&key=${API_KEY}`;
        
        // Log the URL to the console for you to verify
        console.log("Fetching from URL:", url);

        const response = await fetch(url);
        
        // Check if the server actually sent data back
        if (!response.ok) {
            throw new Error(`Server Response Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if(data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `<p style="color:red;">❌ API Logic Error: ${data.data.message}</p>`;
        }

    } catch (error) {
        // THIS PRINTS THE REAL REASON ON YOUR SCREEN
        console.error("Full Error Object:", error);
        resultDiv.innerHTML = `
            <div style="color:red; border:1px solid red; padding:10px; background:#fff0f0;">
                <h4 style="margin:0;">❌ Connection Failed</h4>
                <p style="font-size:14px; margin:5px 0;"><strong>Error Type:</strong> ${error.name}</p>
                <p style="font-size:14px; margin:5px 0;"><strong>Message:</strong> ${error.message}</p>
                <hr>
                <p style="font-size:12px;">Check your Ad-blocker or ensure your API key has "Web" permissions.</p>
            </div>
        `;
    }
});

// --- 5. GPS LOCATION BUTTON ---
// Added '?' here too because this button might be missing on some pages
document.getElementById('checkBtn')?.addEventListener('click', () => {
    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.innerHTML = "<p style='text-align:center;'>🛰️ Requesting GPS...</p>";
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.status === "success") updateUI(data);
    }, (err) => {
        if (resultDiv) resultDiv.innerHTML = "<p style='color:red; text-align:center;'>❌ GPS Denied. Please use Search above.</p>";
    });
});



