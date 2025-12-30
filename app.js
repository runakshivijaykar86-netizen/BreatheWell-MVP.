const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQIValue = 0;

// 1. Initialize Date
document.getElementById('date-display').innerText = new Date().toDateString();

// 2. Medical Advisory Engine
function getAdvice(aqi) {
    if (aqi <= 50) return { 
        status: "Healthy", 
        color: "#22c55e", // Neon Green
        bg: "rgba(34, 197, 94, 0.1)", 
        now: "Optimal oxygen levels.", 
        future: "Supports healthy heart aging.", 
        precautions: "No mask needed." 
    };
    if (aqi <= 100) return { 
        status: "Moderate", 
        color: "#f59e0b", // Amber
        bg: "rgba(245, 158, 11, 0.1)", 
        now: "Possible minor throat irritation.", 
        future: "Low chronic impact.", 
        precautions: "Sensitive groups limit cardio." 
    };
    if (aqi <= 200) return { 
        status: "Unhealthy", 
        color: "#ef4444", // Bright Red
        bg: "rgba(239, 68, 68, 0.1)", 
        now: "Systemic inflammation and fatigue.", 
        future: "High risk of Chronic Bronchitis.", 
        precautions: "N95 Respirator Required." 
    };
    return { 
        status: "Hazardous", 
        color: "#a855f7", // Electric Purple
        bg: "rgba(168, 85, 247, 0.1)", 
        now: "Severe heart and lung stress.", 
        future: "Significant Stroke/Heart Attack risk.", 
        precautions: "STAY INDOORS. Seal windows." 
    };
}
// 3. UI Updater
function updateUI(data) {
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getAdvice(aqi);
    currentAQIValue = aqi;

    // Sync input field so PDF/Search always have a name
    document.getElementById('city').value = city;

    // Reveal UI
    document.getElementById('result-placeholder').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('symptoms-tracker').style.display = 'block';
    
    // Update Dashboard Content
    document.getElementById('display-city').innerText = city;
    document.getElementById('display-aqi').innerText = aqi;
    const statusPill = document.getElementById('display-status');
    statusPill.innerText = med.status;
    statusPill.style.backgroundColor = med.bg;
    statusPill.style.color = med.color;
    document.getElementById('risk-card').style.borderLeft = `10px solid ${med.color}`;
    
    document.getElementById('display-now').innerText = med.now;
    document.getElementById('display-future').innerText = med.future;

    // Emergency Logic (AQI > 300)
    document.getElementById('emergency-zone').style.display = (aqi >= 300) ? "block" : "none";

    // WhatsApp Share Update
    const waMsg = `🚨 BREATHEWELL HEALTH ALERT: ${city}\nAQI: ${aqi}\nPrecaution: ${med.precautions}\nCheck live: ${window.location.href}`;
    document.getElementById('whatsappBtn').href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    // Visual Updates
    const coords = data.data.location.coordinates;
    updateMap(coords[1], coords[0], aqi);
    drawChart(aqi, med.color);
}

// 4. Search & GPS Engines
async function search(c, s, co) {
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
        else alert("Location not found. Use exact spelling (e.g., Delhi, Maharashtra, India).");
    } catch (e) { alert("Network error. Please check your connection."); }
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
    }, () => alert("GPS Permission Denied."));
});

// 5. Visual Engines (Map & Chart)
function updateMap(lat, lon, aqi) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else { map.setView([lat, lon], 12); }
    if (marker) map.removeLayer(marker);
    marker = L.circleMarker([lat, lon], { radius: 10, fillColor: "#0078d4", color: "#fff", weight: 3, fillOpacity: 1 }).addTo(map);
}

function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h'],
            datasets: [{ label: 'AQI Forecast', data: [aqi, aqi+4, aqi-2, aqi-5], borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 6. Symptoms Analysis & PDF
function analyzeSymptoms() {
    const selected = Array.from(document.querySelectorAll('.symptom:checked')).map(s => s.value);
    const reportDiv = document.getElementById('personal-report');
    if (selected.length === 0) { reportDiv.innerHTML = "❌ Select symptoms above."; return; }
    
    let analysis = `At ${currentAQIValue} AQI, ${selected.join(', ')} are likely environmental responses. `;
    if (currentAQIValue > 150) analysis += "Particulate matter is likely entering your bloodstream.";
    
    reportDiv.innerHTML = `<div style="padding:12px; background:#f1f5f9; border-radius:10px; border-left: 4px solid #1e293b;">
        <strong>Clinical Note:</strong> ${analysis}
    </div>`;
}

document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const city = document.getElementById('display-city').innerText;
    const med = getAdvice(currentAQIValue);

    doc.setFontSize(22);
    doc.setTextColor(0, 120, 212);
    doc.text("BreatheWell Health Report", 20, 20);
    
    doc.setFontSize

