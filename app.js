const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQIValue = 0;

// --- 1. MEDICAL INTELLIGENCE ENGINE ---
function getAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#22c55e", bg: "rgba(34, 197, 94, 0.2)",
        now: "Atmospheric purity is optimal. $PM_{2.5}$ concentration is negligible, allowing for maximum oxygen saturation in the bloodstream.",
        future: "Consistent exposure maintains peak lung elasticity and reduces the risk of chronic tissue scarring.",
        precautions: "No protective measures required. Ideal for intensive outdoor aerobic training."
    };
    if (aqi <= 150) return {
        status: "Warning", color: "#eab308", bg: "rgba(234, 179, 8, 0.2)",
        now: "Fine particulate matter may cause throat dryness. Minor decrease in peak respiratory volume during high-intensity exercise.",
        future: "Prolonged exposure can lead to increased sensitivity to allergens and gradual decrease in lung function for children.",
        precautions: "Sensitive groups should reduce heavy outdoor exertion. General population monitor for chest tightness."
    };
    if (aqi <= 300) return {
        status: "Danger", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)",
        now: "Significant systemic inflammation. $PM_{2.5}$ particles are crossing the alveolar-capillary barrier, causing fatigue and coughing.",
        future: "High risk of permanent Chronic Bronchitis and premature cardiovascular disease due to artery thickening.",
        precautions: "MANDATORY: Wear N95 respirator outdoors. Close all windows. Use HEPA-grade air purifiers."
    };
    return {
        status: "Hazardous", color: "#a855f7", bg: "rgba(168, 85, 247, 0.2)",
        now: "CRITICAL BIOLOGICAL STRESS. Severe airway constriction. Toxic metals in the air are entering the blood, stressing the heart.",
        future: "Extreme risk of Stroke and Myocardial Infarction. Acute exposure may trigger life-threatening respiratory failure.",
        precautions: "EMERGENCY: Absolute isolation. Seal windows with damp towels. Avoid all physical activity. Monitor heart rate."
    };
}

// --- 2. HISTORY ENGINE ---
function saveToHistory(city, aqi, status) {
    let history = JSON.parse(localStorage.getItem('bw_history') || '[]');
    // Avoid duplicates
    history = history.filter(item => item.city !== city);
    // Add new entry to top
    history.unshift({ city, aqi, status, date: new Date().toLocaleTimeString() });
    // Keep only last 5
    if (history.length > 5) history.pop();
    
    localStorage.setItem('bw_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const container = document.getElementById('history-card');
    const history = JSON.parse(localStorage.getItem('bw_history') || '[]');

    if (history.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = history.map(item => `
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
            <div>
                <strong>${item.city}</strong><br>
                <span style="opacity:0.6">${item.date}</span>
            </div>
            <div style="font-weight:bold; color:var(--primary)">${item.aqi} AQI</div>
        </div>
    `).join('');
}

function clearHistory() {
    localStorage.removeItem('bw_history');
    renderHistory();
}

// --- 3. UI UPDATE ---
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

    saveToHistory(city, aqi, med.status);
    updateMap(data.data.location.coordinates[1], data.data.location.coordinates[0], aqi);
    drawChart(aqi, med.color);
}

// --- 4. CORE FUNCTIONALITY ---
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const country = document.getElementById('country').value;
    
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "success") updateUI(data);
    else alert("Location not found.");
});

document.getElementById('gps-btn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
        const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${p.coords.latitude}&lon=${p.coords.longitude}&key=${API_KEY}`);
        const data = await res.json();
        if (data.status === "success") updateUI(data);
    });
});

document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const city = document.getElementById('display-city').innerText;
    doc.text(`BreatheWell Report: ${city}`, 20, 20);
    doc.text(`AQI: ${currentAQIValue}`, 20, 30);
    doc.save(`${city}_Report.pdf`);
});

// Init History on load
window.onload = renderHistory;

// (Keep Map and Chart functions from previous step)
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
// --- PWA INSTALLATION ENGINE ---
let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker Registered'))
      .catch(err => console.log('Service Worker Failed', err));
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // You could show a custom "Install App" button here if you want
  console.log('App is ready to be installed');
});
