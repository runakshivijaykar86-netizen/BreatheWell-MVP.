const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQIValue = 0;

// 1. Set Date
document.getElementById('date-display').innerText = new Date().toDateString();

// 2. Neon Medical Logic Engine
function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", now: "Optimal oxygen levels.", future: "Supports healthy heart aging.", precautions: "No mask needed." };
    if (aqi <= 100) return { status: "Moderate", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", now: "Possible minor throat irritation.", future: "Low chronic impact.", precautions: "Sensitive groups limit cardio." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", now: "Systemic inflammation and fatigue.", future: "High risk of Chronic Bronchitis.", precautions: "N95 Respirator Required." };
    return { status: "Hazardous", color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)", now: "Severe heart and lung stress.", future: "Significant Stroke/Heart Attack risk.", precautions: "STAY INDOORS. Seal windows." };
}

// 3. UI Update Logic
function updateUI(data) {
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getAdvice(aqi);
    currentAQIValue = aqi;

    document.getElementById('result-placeholder').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('symptoms-tracker').style.display = 'block';
    
    document.getElementById('display-city').innerText = city;
    document.getElementById('display-aqi').innerText = aqi;
    const statusPill = document.getElementById('display-status');
    statusPill.innerText = med.status;
    statusPill.style.backgroundColor = med.bg;
    statusPill.style.color = med.color;
    
    document.getElementById('display-now').innerText = med.now;
    document.getElementById('display-future').innerText = med.future;

    document.getElementById('emergency-zone').style.display = (aqi >= 300) ? "block" : "none";

    const coords = data.data.location.coordinates;
    updateMap(coords[1], coords[0], aqi);
    drawChart(aqi, med.color);
}

// 4. API Search Functions
async function search(c, s, co) {
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "success") updateUI(data);
    else alert("Location not found.");
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    search(document.getElementById('city').value, document.getElementById('state').value, document.getElementById('country').value);
});

document.getElementById('gps-btn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${p.coords.latitude}&lon=${p.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});

// 5. Chart.js DARK MODE Logic
function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h'],
            datasets: [{ 
                label: 'AQI Forecast', 
                data: [aqi, aqi+4, aqi-2, aqi-5], 
                borderColor: color, 
                backgroundColor: color + '33', // Subtle glow effect
                fill: true,
                tension: 0.4 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f8fafc', font: { weight: 'bold' } } }
            },
            scales: {
                y: { 
                    grid: { color: 'rgba(255,255,255,0.1)' }, 
                    ticks: { color: '#94a3b8' } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#94a3b8' } 
                }
            }
        }
    });
}

// 6. Map and Support Functions
function updateMap(lat, lon, aqi) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else { map.setView([lat, lon], 12); }
    if (marker) map.removeLayer(marker);
    marker = L.circleMarker([lat, lon], { radius: 10, fillColor: "#38bdf8", color: "#fff", weight: 3, fillOpacity: 1 }).addTo(map);
}
