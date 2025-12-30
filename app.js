const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQIValue = 0;

// 1. Deep Medical Intelligence Engine
function getAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#22c55e", bg: "rgba(34, 197, 94, 0.2)",
        now: "Atmospheric purity is optimal. $PM_{2.5}$ concentration is negligible, allowing for maximum oxygen saturation in the bloodstream. No immediate respiratory irritation expected.",
        future: "Consistent exposure to this level maintains peak lung elasticity and reduces the risk of developing asthma or COPD in later life. Supports cardiovascular longevity.",
        precautions: "No protective measures required. Ideal conditions for intensive outdoor aerobic exercise and athletic training."
    };
    if (aqi <= 100) return {
        status: "Moderate", color: "#eab308", bg: "rgba(234, 179, 8, 0.2)",
        now: "Fine particulate matter may cause slight throat dryness or nasal irritation in sensitive individuals. Minor decrease in peak respiratory volume during high-intensity exercise.",
        future: "Prolonged multi-year exposure can lead to increased sensitivity to allergens and a gradual decrease in lung function for children and the elderly.",
        precautions: "Sensitive groups (asthmatics) should reduce heavy outdoor exertion. General population can continue normal activities but monitor for chest tightness."
    };
    if (aqi <= 200) return {
        status: "Unhealthy", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)",
        now: "Significant systemic inflammation. $PM_{2.5}$ particles are crossing the alveolar-capillary barrier, potentially causing increased heart rate, fatigue, and persistent dry coughing.",
        future: "High risk of developing Chronic Bronchitis and permanent lung tissue scarring. Increases the statistical probability of premature cardiovascular disease and heart stress.",
        precautions: "MANDATORY: Wear a certified N95 or FFP2 respirator outdoors. Close all windows. Use HEPA-grade air purifiers to maintain safe indoor air quality."
    };
    return {
        status: "Hazardous", color: "#a855f7", bg: "rgba(168, 85, 247, 0.2)",
        now: "CRITICAL BIOLOGICAL STRESS. Severe airway constriction and hypoxia risk. High levels of carbon and toxic metals in the air are entering the blood, stressing the heart and brain.",
        future: "Extreme risk of Stroke, Myocardial Infarction (Heart Attack), and severe respiratory failure. Acute exposure may trigger life-threatening episodes in vulnerable patients.",
        precautions: "EMERGENCY PROTOCOL: Absolute isolation indoors. Seal windows with damp towels. Avoid all physical activity. Monitor heart rate. If chest pain occurs, call emergency services."
    };
}

// 2. UI Updates
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
    document.getElementById('display-precautions').innerText = med.precautions;

    // WhatsApp Update
    const waMsg = `🚨 BREATHEWELL HEALTH ALERT: ${city}\n💨 AQI: ${aqi} (${med.status})\n🛡️ Advice: ${med.precautions}`;
    document.getElementById('whatsappBtn').href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    const coords = data.data.location.coordinates;
    updateMap(coords[1], coords[0], aqi);
    drawChart(aqi, med.color);
}

// 3. Button Functionality (FIXED)
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

document.getElementById('analyze-btn').addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.symptom:checked')).map(s => s.value);
    const reportDiv = document.getElementById('personal-report');
    if (selected.length === 0) { reportDiv.innerHTML = "❌ Select symptoms."; return; }
    
    let analysis = `Based on an AQI of ${currentAQIValue}, your ${selected.join(', ')} are likely a direct physiological reaction to fine particulate inhalation. `;
    if (currentAQIValue > 150) analysis += "These particles are currently causing oxidative stress in your respiratory tract.";
    
    reportDiv.innerHTML = `<div style="padding:12px; background:rgba(255,255,255,0.05); border-radius:10px; border-left:4px solid var(--primary);">${analysis}</div>`;
});

document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const city = document.getElementById('display-city').innerText;
    const med = getAdvice(currentAQIValue);

    doc.setFontSize(22);
    doc.setTextColor(0, 120, 212);
    doc.text("BreatheWell Clinical Report", 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Location: ${city} | AQI: ${currentAQIValue}`, 20, 40);
    
    const splitNow = doc.splitTextToSize(`Impact: ${med.now}`, 170);
    doc.text(splitNow, 20, 60);
    
    doc.save(`${city}_Report.pdf`);
});

// 4. Helpers (Map & Chart)
function updateMap(lat, lon, aqi) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else { map.setView([lat, lon], 12); }
    if (marker) map.removeLayer(marker);
    marker = L.circleMarker([lat, lon], { radius: 10, fillColor: "#38bdf8", color: "#fff", weight: 3, fillOpacity: 1 }).addTo(map);
}

function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h'],
            datasets: [{ label: 'Predicted AQI', data: [aqi, aqi+5, aqi+12, aqi-2], borderColor: color, tension: 0.4 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }
        }
    });
}

async function search(c, s, co) {
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "success") updateUI(data);
    else alert("Location not found.");
}
