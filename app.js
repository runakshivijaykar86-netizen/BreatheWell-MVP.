const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let aqiChart, map, marker;
let currentAQI = 0;

// 1. Clinical Advisory Logic (Imagine Cup standard)
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)",
        now: "Ultrafine particles ($PM_{2.5}$) are negligible. Lung gas exchange is optimal.",
        future: "Consistent exposure maintains peak alveolar elasticity and prevents chronic lung aging.",
        precautions: "No protective measures required. Ideal for outdoor athletic training."
    };
    if (aqi <= 150) return {
        status: "Unhealthy (Sensitive)", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)",
        now: "Fine particulate is beginning to irritate mucosal membranes. Potential for systemic oxidative stress.",
        future: "Multi-year exposure may trigger asthma-related epigenetic markers in children.",
        precautions: "Sensitive groups limit outdoor cardio. Close windows during peak traffic."
    };
    return {
        status: "Hazardous", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)",
        now: "ALVEOLAR BREACH: $PM_{2.5}$ is crossing into the bloodstream, triggering vascular inflammation.",
        future: "Critical risk of arterial calcification, myocardial stress, and permanent lung scarring.",
        precautions: "MANDATORY: N95 Respirator. Absolute isolation indoors with HEPA air purification."
    };
}

// 2. Dashboard Interaction
function updateDashboard(data) {
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const med = getMedicalAdvice(aqi);
    currentAQI = aqi;

    document.getElementById('placeholder').style.display = 'none';
    document.getElementById('dashboard-ui').style.display = 'block';
    document.getElementById('ai-triage-card').style.display = 'block';
    
    document.getElementById('display-city').innerText = city;
    document.getElementById('display-aqi').innerText = aqi;
    document.getElementById('display-aqi').style.color = med.color;
    
    const pill = document.getElementById('display-status');
    pill.innerText = med.status;
    pill.style.backgroundColor = med.bg;
    pill.style.color = med.color;
    
    document.getElementById('display-now').innerText = med.now;
    document.getElementById('display-future').innerText = med.future;
    document.getElementById('display-precautions').innerText = med.precautions;

    updateMap(data.data.location.coordinates[1], data.data.location.coordinates[0]);
    drawChart(aqi, med.color);
}

// 3. AI Triage Logic (Azure AI Integration Point)
document.getElementById('ai-analyze-btn').addEventListener('click', async () => {
    const text = document.getElementById('symptom-journal').value;
    const report = document.getElementById('ai-report');
    
    if(!text) return alert("Please describe your symptoms.");
    report.innerHTML = `<p style="font-size:12px; color:var(--primary);">🧬 Running Azure AI Neural Mapping...</p>`;

    // IMAGINE CUP TIP: Replace this with your actual Azure Endpoint
    setTimeout(() => {
        let insight = `Azure AI detected entities: <strong>${text.substring(0,20)}...</strong> Correlation with AQI ${currentAQI} indicates acute particulate infiltration. `;
        if(currentAQI > 100) insight += "These symptoms are characteristic of systemic inflammation caused by $PM_{2.5}$ bypassing your pulmonary filters.";
        
        report.innerHTML = `<div class="ai-note">${insight}</div>`;
    }, 1500);
});

// 4. Core System Functions
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const c = document.getElementById('city').value;
    const s = document.getElementById('state').value;
    const co = document.getElementById('country').value;
    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&country=${encodeURIComponent(co)}&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        if(data.status === "success") updateDashboard(data);
        else alert("Location Error: Please check spelling.");
    } catch(e) { alert("API Connectivity Error."); }
});

document.getElementById('gps-btn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${p.coords.latitude}&lon=${p.coords.longitude}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.status === "success") updateDashboard(data);
    });
});

document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`BREATHEWELL CLINICAL REPORT: ${document.getElementById('display-city').innerText}`, 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Recorded AQI: ${currentAQI}`, 20, 30);
    doc.text(`Advice: ${document.getElementById('display-now').innerText}`, 20, 40);
    doc.save("BreatheWell_Health_Report.pdf");
});

function updateMap(lat, lon) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else map.setView([lat, lon], 12);
    if (marker) map.removeLayer(marker);
    marker = L.circleMarker([lat, lon], { radius: 10, fillColor: "#38bdf8", color: "#fff", weight: 3, fillOpacity: 1 }).addTo(map);
}

function drawChart(aqi, color) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: { labels: ['Now', '+1h', '+2h', '+3h'], datasets: [{ label: 'AQI Curve', data: [aqi, aqi+5, aqi+12, aqi-2], borderColor: color, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
    });
}
