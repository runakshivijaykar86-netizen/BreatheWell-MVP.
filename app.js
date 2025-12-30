const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQIValue = 0;

document.getElementById('date-display').innerText = new Date().toDateString();

function getAdvice(aqi) {
    if (aqi <= 50) return { status: "Healthy", color: "#10b981", bg: "#ecfdf5", now: "Optimal oxygen levels. No acute symptoms.", future: "Supports healthy heart and lung aging.", precautions: "No mask needed." };
    if (aqi <= 100) return { status: "Moderate", color: "#f59e0b", bg: "#fffbeb", now: "Possible minor throat irritation for some.", future: "Low chronic impact if exposure is limited.", precautions: "Sensitive groups limit outdoor cardio." };
    if (aqi <= 200) return { status: "Unhealthy", color: "#ef4444", bg: "#fef2f2", now: "Systemic inflammation, fatigue, coughing.", future: "High risk of Chronic Bronchitis / COPD.", precautions: "N95 Respirator Required Outdoors." };
    return { status: "Hazardous", color: "#7c3aed", bg: "#f5f3ff", now: "Severe cardiovascular and lung stress.", future: "Significant risk of Stroke and Heart Attack.", precautions: "STAY INDOORS. Seal all windows." };
}

function updateUI(data) {
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getAdvice(aqi);
    currentAQIValue = aqi;

    // Show/Hide Elements
    document.getElementById('result-placeholder').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('symptoms-tracker').style.display = 'block';
    
    // Update Text
    document.getElementById('display-city').innerText = city;
    document.getElementById('display-aqi').innerText = aqi;
    const statusPill = document.getElementById('display-status');
    statusPill.innerText = med.status;
    statusPill.style.backgroundColor = med.bg;
    statusPill.style.color = med.color;
    
    document.getElementById('display-now').innerText = med.now;
    document.getElementById('display-future').innerText = med.future;

    // Emergency Logic
    document.getElementById('emergency-zone').style.display = (aqi >= 300) ? "block" : "none";

    // Update Links
    const waMsg = `🚨 BREATHEWELL HEALTH ALERT: ${city}\nAQI: ${aqi}\nPrecaution: ${med.precautions}`;
    document.getElementById('whatsappBtn').href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    // Update Visuals
    const coords = data.data.location.coordinates;
    updateMap(coords[1], coords[0], aqi);
    drawChart(aqi, med.color);
}

// ... Keep your search, GPS, map, and PDF logic from previous steps, but ensure they target the new IDs ...

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

function updateMap(lat, lon, aqi) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else {
        map.setView([lat, lon], 12);
    }
    if (marker) map.removeLayer(marker);
    marker = L.circleMarker([lat, lon], { radius: 10, fillColor: "#0078d4", color: "#fff", fillOpacity: 1 }).addTo(map);
}

function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h'],
            datasets: [{ label: 'AQI Forecast', data: [aqi, aqi+4, aqi-2, aqi-5], borderColor: color, tension: 0.4 }]
        }
    });
}
