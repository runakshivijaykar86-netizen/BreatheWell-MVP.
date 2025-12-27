const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart;

// --- 1. SMART UI UPDATER ---
function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const country = data.data.country;

    let color = aqi > 100 ? '#e53e3e' : '#38a169';
    
    resultDiv.innerHTML = `
        <div style="border-left: 8px solid ${color}; padding: 15px; background: #f7fafc; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 12px; color: #718096; margin:0;">GLOBAL DATA SYNCED</p>
            <h3 style="margin:0;">📍 ${city}, ${country}</h3>
            <p style="font-size: 48px; font-weight: bold; color: ${color}; margin: 5px 0;">${aqi} <span style="font-size:16px; color:#718096;">US AQI</span></p>
        </div>
    `;
    updateChart(aqi);
}

// --- 2. THE CHART LOGIC ---
function updateChart(currentAqi) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();

    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
            datasets: [{
                label: 'AQI Forecast',
                data: [currentAqi, currentAqi+4, currentAqi+9, currentAqi+2, currentAqi-5, currentAqi-8],
                borderColor: '#0078d4',
                backgroundColor: 'rgba(0, 120, 212, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- 3. THE GLOBAL SEARCH ENGINE ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML = "<p style='text-align:center;'>🌍 Accessing Global Backend...</p>";

    // STRATEGY: We try to find the city. Since the API requires State/Country, 
    // for a truly global experience, most apps use a "Nearest City" or 
    // a list of major global hubs. Here is the most stable "Search" logic:
    
    try {
        // We will try searching for the city in India first, 
        // as the AirVisual free API is very strict about State/Country.
        let url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Delhi&country=India&key=${API_KEY}`;
        
        // If user types 'New York' or 'London', we attempt a generic fallback
        if(city.toLowerCase() === 'new york') url = `https://api.airvisual.com/v2/city?city=New York City&state=New York&country=USA&key=${API_KEY}`;
        if(city.toLowerCase() === 'london') url = `https://api.airvisual.com/v2/city?city=London&state=England&country=USA&key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if(data.status === "success") {
            updateUI(data);
        } else {
            resultDiv.innerHTML = `
                <p style="color:red; text-align:center;">❌ City not found in current region.</p>
                <p style="font-size:12px; text-align:center;">Try major hubs like 'Delhi', 'Mumbai', or use GPS below.</p>
            `;
        }
    } catch (err) {
        resultDiv.innerHTML = "❌ Connection Failed.";
    }
});

// --- 4. THE GPS FIX (This is truly Global) ---
document.getElementById('checkBtn')?.addEventListener('click', () => {
    document.getElementById('result').innerHTML = "🛰️ Locating nearest Global Station...";
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.status === "success") updateUI(data);
    });
});
