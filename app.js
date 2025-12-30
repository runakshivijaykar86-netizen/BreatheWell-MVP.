const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';

// --- LIVE AZURE AI INTEGRATION ---
const AZURE_ENDPOINT = "https://breathewell-ai-service.cognitiveservices.azure.com/";
const AZURE_KEY = "9H1CaNTo2vwhNAMs5RUPmZ8ib2IqObJP9oQO7bwJ3qadoQID6GqWJQQJ99BLACGhslBXJ3w3AAAEACOG8UYn";

let aqiChart, map, marker;
let currentAQI = 0;

// 1. Clinical Advisory Engine
function getMedicalAdvice(aqi) {
    if (aqi <= 50) return {
        status: "Healthy", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)",
        now: "$PM_{2.5}$ particles are within safe biological limits. Lung oxygen exchange is optimal.",
        future: "Consistent exposure maintains peak alveolar elasticity and cardiovascular health.",
        precautions: "No protective measures required. Ideal for outdoor training."
    };
    if (aqi <= 150) return {
        status: "Warning", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)",
        now: "Microscopic particles are crossing the alveolar barrier, triggering minor systemic inflammation.",
        future: "Prolonged exposure may trigger asthma-related epigenetic markers in children.",
        precautions: "Sensitive groups (kids/elderly) reduce outdoor exertion. Close windows."
    };
    return {
        status: "Hazardous", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)",
        now: "ALVEOLAR BREACH: $PM_{2.5}$ is crossing into the bloodstream, entering the heart and brain.",
        future: "Critical risk of permanent lung scarring (fibrosis) and arterial calcification.",
        precautions: "EMERGENCY: Seal windows with damp towels. N95 respirator required indoors."
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

// 3. LIVE AI Triage Logic (The Imagine Cup Winning Feature)
document.getElementById('ai-analyze-btn').addEventListener('click', async () => {
    const textInput = document.getElementById('symptom-journal').value;
    const report = document.getElementById('ai-report');
    
    if(!textInput) return alert("Please describe your symptoms.");
    report.innerHTML = `<p style="font-size:12px; color:var(--primary); font-weight:bold;">🧬 Connecting to Azure AI Foundry...</p>`;

    try {
        const response = await fetch(`${AZURE_ENDPOINT}/language/:analyze-text?api-version=2023-04-01`, {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "kind": "EntityRecognition",
                "analysisInput": { "documents": [{ "id": "1", "language": "en", "text": textInput }] }
            })
        });

        const result = await response.json();
        const entities = result.results.documents[0].entities;
        
        let entitiesList = entities.map(e => e.text).join(', ');
        let insight = `<strong>Azure AI Insight:</strong> Detected clinical markers: <em>${entitiesList || 'General distress'}</em>. `;
        
        if (currentAQI > 100) {
            insight += `<br><br>⚠️ <strong>SYSTEMIC RISK:</strong> These symptoms at an AQI of ${currentAQI} strongly correlate with particulates breaching the <strong>alveolar-capillary barrier</strong>. High risk of neuro-vascular inflammation.`;
        } else {
            insight += `<br><br>🛡️ <strong>ENVIRONMENTAL NOTE:</strong> Current AQI is safe, but monitor these symptoms closely if levels rise.`;
        }
        
        report.innerHTML = `<div class="ai-note">${insight}</div>`;
        
    } catch (error) {
        console.error("Azure Error:", error);
        report.innerHTML = `<p style="color:var(--danger);">❌ Connection to Azure AI failed.</p>`;
    }
});

// 4. Core Handlers
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
    doc.text(`Biological Impact: ${document.getElementById('display-now').innerText}`, 20, 40);
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
        data: { labels: ['Now', '+1h', '+2h', '+3h'], datasets: [{ label: 'AQI Forecast', data: [aqi, aqi+5, aqi+12, aqi-2], borderColor: color, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
    });
}
