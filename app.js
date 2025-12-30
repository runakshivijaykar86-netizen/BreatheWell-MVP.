const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQIValue = 0;

function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#22c55e", bg: "rgba(34, 197, 94, 0.2)", now: "Optimal oxygen levels.", future: "Low risk of lung aging.", precautions: "No mask needed." };
    if (aqi <= 100) return { status: "Moderate", color: "#eab308", bg: "rgba(234, 179, 8, 0.2)", now: "Possible minor throat irritation.", future: "Slight allergy risk.", precautions: "Sensitive groups limit exertion." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)", now: "Systemic inflammation.", future: "High Chronic Bronchitis risk.", precautions: "N95 Mask Recommended." };
    return { status: "Hazardous", color: "#a855f7", bg: "rgba(168, 85, 247, 0.2)", now: "Severe heart/lung stress.", future: "Stroke & Heart Attack risk.", precautions: "STAY INDOORS." };
}

function updateUI(data) {
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getAdvice(aqi);
    currentAQIValue = aqi;

    document.getElementById('placeholder').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('tracker-card').style.display = 'block';
    
    document.getElementById('display-city').innerText = city;
    document.getElementById('display-aqi').innerText = aqi;
    document.getElementById('display-aqi').style.color = med.color;
    
    const statusPill = document.getElementById('display-status');
    statusPill.innerText = med.status;
    statusPill.style.backgroundColor = med.bg;
    statusPill.style.color = med.color;
    
    document.getElementById('display-now').innerText = med.now;
    document.getElementById('display-future').innerText = med.future;
    document.getElementById('emergency-banner').style.display = (aqi >= 300) ? "block" : "none";

    const waMsg = `🚨 HEALTH ALERT: ${city} (AQI: ${aqi})\nAdvice: ${med.precautions}`;
    document.getElementById('whatsappBtn').href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    const coords = data.data.location.coordinates;
    updateMap(coords[1], coords[0], aqi);
    drawChart(aqi, med.color);
}

// Map Logic
function updateMap(lat, lon, aqi) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else { map.setView([lat, lon], 12); }
    if (marker) map.removeLayer(marker);
    marker = L.circleMarker([lat, lon], { radius: 10, fillColor: "#38bdf8", color: "#fff", weight: 3, fillOpacity: 1 }).addTo(map);
}

// Chart Logic with White Text for Dark Theme
function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h'],
            datasets: [{ label: 'AQI Forecast', data: [aqi, aqi+6, aqi+12, aqi-2], borderColor: color, tension: 0.4 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                x: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// Search and GPS
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
