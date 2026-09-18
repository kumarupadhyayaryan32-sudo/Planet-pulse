"use strict";

/* =========================================================
   🌍 PLANETPULSE — Carbon Footprint Dashboard
   ========================================================= */

const emissionFactors = {
    car: 0.20, bus: 0.08, flight: 0.25,
    electricity: 0.80, "veg-meal": 0.5, "nonveg-meal": 2.0
};

const activityNames = {
    car: "Car", bus: "Bus", flight: "Flight",
    electricity: "Electricity", "veg-meal": "Veg Meal", "nonveg-meal": "Non-Veg Meal"
};

const activityUnits = {
    car: "km", bus: "km", flight: "km",
    electricity: "kWh", "veg-meal": "meal", "nonveg-meal": "meal"
};

const activityIcons = {
    car: "🚗", bus: "🚌", flight: "✈️",
    electricity: "⚡", "veg-meal": "🥗", "nonveg-meal": "🍗"
};

const inputLimits = {
    car: 5000, bus: 5000, flight: 50000,
    electricity: 10000, "veg-meal": 100, "nonveg-meal": 100
};

const ACTIVITY_TYPES = ["car", "bus", "flight", "electricity", "veg-meal", "nonveg-meal"];

const barChartColors = {
    car: "#2f6f46",
    bus: "#3c8d5a",
    flight: "#7fbb8d",
    electricity: "#d9a441",
    "veg-meal": "#4f9d69",
    "nonveg-meal": "#c1584f"
};


/* =========================================================
   STORAGE
   ========================================================= */

const ACTIVITIES_KEY = "planetpulseActivities";
const TARGET_KEY = "planetpulseTarget";

function loadActivities() {
    try {
        const saved = localStorage.getItem(ACTIVITIES_KEY);
        if (!saved) return [];
        const data = JSON.parse(saved);
        if (!Array.isArray(data)) return [];
        return data.filter(a =>
            a && a.type &&
            Number.isFinite(Number(a.quantity)) &&
            Number.isFinite(Number(a.co2)) &&
            a.date
        );
    } catch (error) {
        console.error("Storage error:", error);
        return [];
    }
}

let activities = loadActivities();
let weeklyTarget = Number(localStorage.getItem(TARGET_KEY)) || 0;

function saveActivities() {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const activityForm = document.getElementById("activityForm");
const activityType = document.getElementById("activityType");
const quantityInput = document.getElementById("quantity");
const quantityUnit = document.getElementById("quantityUnit");
const calculationResult = document.getElementById("calculationResult");

const totalCO2 = document.getElementById("totalCO2");
const transportCO2 = document.getElementById("transportCO2");
const electricityCO2 = document.getElementById("electricityCO2");
const foodCO2 = document.getElementById("foodCO2");

const weeklyTargetInput = document.getElementById("weeklyTarget");
const saveTargetButton = document.getElementById("saveTarget");
const targetStatus = document.getElementById("targetStatus");
const targetPercentage = document.getElementById("targetPercentage");
const progressBar = document.getElementById("progressBar");

const historyList = document.getElementById("historyList");
const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");
const clearFilters = document.getElementById("clearFilters");
const exportData = document.getElementById("exportData");
const clearData = document.getElementById("clearData");

const totalActivities = document.getElementById("totalActivities");
const weeklyActivities = document.getElementById("weeklyActivities");
const averageCO2 = document.getElementById("averageCO2");
const weekRange = document.getElementById("weekRange");

const insightsCard = document.getElementById("insightsCard");
const loadDemoButton = document.getElementById("loadDemo");

const donutChart = document.getElementById("donutChart");
const donutTotalEl = document.getElementById("donutTotal");
const legendTransport = document.getElementById("legendTransport");
const legendElectricity = document.getElementById("legendElectricity");
const legendFood = document.getElementById("legendFood");

const activityBarChartEl = document.getElementById("activityBarChart");
const topTotalActivitiesEl = document.getElementById("topTotalActivities");
const topWeeklyCO2El = document.getElementById("topWeeklyCO2");


/* =========================================================
   WEEK HELPERS (Monday → Sunday)
   ========================================================= */

function getLocalDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getCurrentWeekRange() {
    const now = new Date();
    const monday = new Date(now);
    const day = now.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    monday.setDate(now.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    nextMonday.setHours(0, 0, 0, 0);

    return { start: monday, end: nextMonday };
}

function getWeeklyActivities() {
    const { start, end } = getCurrentWeekRange();
    return activities.filter(a => {
        const date = new Date(a.date);
        return date >= start && date < end;
    });
}

function getWeeklyTotal() {
    return getWeeklyActivities().reduce((sum, a) => sum + Number(a.co2 || 0), 0);
}

function updateWeekLabel() {
    if (!weekRange) return;
    const { start, end } = getCurrentWeekRange();
    const sunday = new Date(end);
    sunday.setDate(sunday.getDate() - 1);

    const startText = start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const endText = sunday.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

    weekRange.textContent = `${startText} – ${endText}`;
}


/* =========================================================
   LIVE CALCULATION
   ========================================================= */

function updateLiveCalculation() {
    if (!activityType || !quantityInput) return;

    const type = activityType.value;
    const quantity = Number(quantityInput.value);

    if (quantityUnit) {
        quantityUnit.textContent = type ? activityUnits[type] : "—";
    }

    if (!type || !Number.isFinite(quantity) || quantity <= 0) return;

    if (inputLimits[type] && quantity > inputLimits[type]) {
        showCalculation("⚠️ This value looks unusually high. Please check your entry.", "error");
        return;
    }

    const co2 = quantity * emissionFactors[type];
    showCalculation(`Estimated footprint: ${co2.toFixed(2)} kg CO₂`, "info");
}

function showCalculation(message, status) {
    if (!calculationResult) return;
    calculationResult.textContent = message;
    calculationResult.dataset.status = status;
}

if (activityType) activityType.addEventListener("change", updateLiveCalculation);
if (quantityInput) quantityInput.addEventListener("input", updateLiveCalculation);


/* =========================================================
   ADD ACTIVITY
   ========================================================= */

if (activityForm) {
    activityForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const type = activityType.value;
        const quantity = Number(quantityInput.value);

        if (!type) {
            showCalculation("Please select an activity.", "error");
            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            showCalculation("Please enter a valid quantity.", "error");
            return;
        }

        if (quantity > inputLimits[type]) {
            showCalculation(
                `⚠️ ${quantity.toLocaleString()} ${activityUnits[type]} seems unrealistic. Please check your entry.`,
                "error"
            );
            showToast("Please check your quantity.", "error");
            return;
        }

        const co2 = quantity * emissionFactors[type];

        activities.push({
            id: Date.now() + Math.random(),
            type, quantity, co2,
            date: new Date().toISOString()
        });

        saveActivities();

        showCalculation(`✓ ${co2.toFixed(2)} kg CO₂ added successfully.`, "success");
        showToast(`${activityIcons[type]} Activity added!`, "success");

        activityForm.reset();
        if (quantityUnit) quantityUnit.textContent = "—";

        updateDashboard();
        updateHistory();
    });
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {
    let total = 0, transport = 0, electricity = 0, food = 0;

    activities.forEach(a => {
        const co2 = Number(a.co2) || 0;
        total += co2;

        if (["car", "bus", "flight"].includes(a.type)) transport += co2;
        else if (a.type === "electricity") electricity += co2;
        else if (["veg-meal", "nonveg-meal"].includes(a.type)) food += co2;
    });

    animateNumber(totalCO2, total, 700, v => v.toFixed(2));

    setText(transportCO2, `${transport.toFixed(2)} kg`);
    setText(electricityCO2, `${electricity.toFixed(2)} kg`);
    setText(foodCO2, `${food.toFixed(2)} kg`);

    updateDonutChart(transport, electricity, food, total);
    renderActivityBarChart();
    updateTarget(getWeeklyTotal());
    updateStats();
    updateWeekLabel();
    updateInsights(transport, electricity, food, total);
}


/* =========================================================
   DONUT CHART
   ========================================================= */

function updateDonutChart(transport, electricity, food, total) {
    if (!donutChart) return;

    if (total <= 0) {
        donutChart.style.background = "conic-gradient(#e8efe9 0deg 360deg)";
        setText(donutTotalEl, "0.00");
        setText(legendTransport, "0%");
        setText(legendElectricity, "0%");
        setText(legendFood, "0%");
        return;
    }

    const transportEnd = (transport / total) * 360;
    const electricityEnd = transportEnd + (electricity / total) * 360;

    donutChart.style.background = `conic-gradient(
        #2f6f46 0deg ${transportEnd}deg,
        #d9a441 ${transportEnd}deg ${electricityEnd}deg,
        #c1584f ${electricityEnd}deg 360deg
    )`;

    setText(donutTotalEl, total.toFixed(2));
    setText(legendTransport, `${Math.round((transport / total) * 100)}%`);
    setText(legendElectricity, `${Math.round((electricity / total) * 100)}%`);
    setText(legendFood, `${Math.round((food / total) * 100)}%`);
}


/* =========================================================
   ACTIVITY COMPARISON BAR CHART (SVG, auto-updates)
   ========================================================= */

function renderActivityBarChart() {
    if (!activityBarChartEl) return;

    const totals = {};
    ACTIVITY_TYPES.forEach(t => totals[t] = 0);
    activities.forEach(a => {
        if (totals[a.type] !== undefined) totals[a.type] += Number(a.co2) || 0;
    });

    const maxVal = Math.max(...ACTIVITY_TYPES.map(t => totals[t]));

    const width = 620, height = 300;
    const padLeft = 46, padRight = 16, padTop = 18, padBottom = 48;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const niceMax = maxVal <= 0 ? 10 : Math.ceil((maxVal * 1.15) / 5) * 5;
    const gridSteps = 4;

    let gridLines = "", gridLabels = "";
    for (let i = 0; i <= gridSteps; i++) {
        const value = (niceMax / gridSteps) * i;
        const y = padTop + chartH - (value / niceMax) * chartH;
        gridLines += `<line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#e5ece7" stroke-width="1"/>`;
        gridLabels += `<text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#7c8a80">${value.toFixed(0)}</text>`;
    }

    const slot = chartW / ACTIVITY_TYPES.length;
    const barWidth = Math.min(44, slot * 0.5);

    let bars = "", labels = "";

    ACTIVITY_TYPES.forEach((type, i) => {
        const value = totals[type];
        const barHeight = (value / niceMax) * chartH;
        const x = padLeft + i * slot + (slot - barWidth) / 2;
        const y = padTop + chartH - barHeight;

        bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(barHeight, 0)}" rx="5" fill="${barChartColors[type]}"><title>${activityNames[type]}: ${value.toFixed(2)} kg</title></rect>`;

        if (value > 0) {
            bars += `<text x="${x + barWidth / 2}" y="${y - 7}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1f4d2e">${value.toFixed(1)}</text>`;
        }

        labels += `<text x="${x + barWidth / 2}" y="${height - padBottom + 20}" text-anchor="middle" font-size="11.5" fill="#3a4d40">${activityNames[type]}</text>`;
    });

    const axis = `
        <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" stroke="#c9d6cd"/>
        <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="#c9d6cd"/>
    `;

    activityBarChartEl.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" class="activity-bar-svg" role="img" aria-label="Activity CO2 comparison chart">
            ${gridLines}
            ${axis}
            ${bars}
            ${labels}
            ${gridLabels}
        </svg>
    `;
}


/* =========================================================
   WEEKLY TARGET
   ========================================================= */

if (saveTargetButton) {
    saveTargetButton.addEventListener("click", function () {
        const target = Number(weeklyTargetInput.value);

        if (!Number.isFinite(target) || target <= 0) {
            showToast("Enter a valid target.", "error");
            return;
        }

        if (target > 100000) {
            showToast("Please enter a realistic target.", "error");
            return;
        }

        weeklyTarget = target;
        localStorage.setItem(TARGET_KEY, weeklyTarget);
        weeklyTargetInput.value = "";

        updateTarget(getWeeklyTotal());
        showToast("🎯 Weekly target saved!", "success");
    });
}

function updateTarget(weeklyTotal) {
    if (!targetStatus) return;

    if (weeklyTarget <= 0) {
        targetStatus.textContent = "Set a weekly target to start tracking.";
        if (targetPercentage) targetPercentage.textContent = "0%";
        setWidth(progressBar, 0);
        return;
    }

    const percentage = (weeklyTotal / weeklyTarget) * 100;
    if (targetPercentage) targetPercentage.textContent = `${Math.round(percentage)}%`;
    setWidth(progressBar, percentage);

    if (weeklyTotal > weeklyTarget) {
        const exceeded = weeklyTotal - weeklyTarget;
        targetStatus.textContent = `⚠️ Target exceeded by ${exceeded.toFixed(2)} kg CO₂. Consider lower-carbon choices for the rest of the week.`;
        targetStatus.style.color = "#b42318";
        return;
    }

    if (weeklyTotal === weeklyTarget) {
        targetStatus.textContent = "🎯 You've reached your weekly target.";
        targetStatus.style.color = "#1f5c3a";
        return;
    }

    const remaining = weeklyTarget - weeklyTotal;
    targetStatus.textContent = `${weeklyTotal.toFixed(2)} / ${weeklyTarget.toFixed(2)} kg · ${remaining.toFixed(2)} kg remaining`;
    targetStatus.style.color = "#647166";
}

function setWidth(element, percentage) {
    if (!element) return;
    element.style.width = `${Math.max(0, Math.min(percentage, 100))}%`;
}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {
    const weekly = getWeeklyActivities();
    const weeklyTotal = getWeeklyTotal();
    const total = activities.reduce((sum, a) => sum + Number(a.co2 || 0), 0);

    setText(totalActivities, activities.length);
    setText(weeklyActivities, weekly.length);
    setText(averageCO2, activities.length ? `${(total / activities.length).toFixed(2)} kg` : "0 kg");

    setText(topTotalActivitiesEl, activities.length);
    setText(topWeeklyCO2El, `${weeklyTotal.toFixed(2)} kg`);
}


/* =========================================================
   SMART INSIGHTS
   ========================================================= */

function updateInsights(transport, electricity, food, total) {
    if (!insightsCard) return;

    if (total <= 0) {
        insightsCard.innerHTML = `<span class="insights-badge">INSIGHT</span><p>Log a few activities to get personalized suggestions.</p>`;
        return;
    }

    const categories = [
        { name: "Transport", value: transport, tip: "Try carpooling, public transport, or biking for short trips — switching one car trip to bus meaningfully cuts that trip's emissions." },
        { name: "Electricity", value: electricity, tip: "Switch off unused appliances, use LED bulbs, and reduce AC usage during peak hours to lower your electricity footprint." },
        { name: "Food", value: food, tip: "Swapping one non-veg meal for a veg meal saves around 1.5 kg CO₂ — try a few plant-based meals this week." }
    ];

    categories.sort((a, b) => b.value - a.value);
    const top = categories[0];

    if (top.value <= 0) {
        insightsCard.innerHTML = `<span class="insights-badge">INSIGHT</span><p>Great start! Keep logging activities to track your impact.</p>`;
        return;
    }

    const share = ((top.value / total) * 100).toFixed(0);

    insightsCard.innerHTML = `
        <span class="insights-badge">INSIGHT</span>
        <p>🔍 <strong>${top.name}</strong> is your biggest contributor (${share}% of your total footprint).</p>
        <p style="margin-top:8px;">💡 ${top.tip}</p>
    `;
}


/* =========================================================
   HISTORY
   ========================================================= */

function updateHistory() {
    if (!historyList) return;

    const selectedType = filterType ? filterType.value : "all";
    const selectedDate = filterDate ? filterDate.value : "";

    let filtered = activities.filter(a => {
        const typeMatch = selectedType === "all" || a.type === selectedType;
        const dateMatch = !selectedDate || getLocalDateKey(new Date(a.date)) === selectedDate;
        return typeMatch && dateMatch;
    });

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌱</div>
                <h3>No activities found</h3>
                <p>Try changing your filters or log a new activity.</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = "";

    filtered.forEach(activity => {
        const item = document.createElement("div");
        item.className = "history-item";

        const date = new Date(activity.date);
        const formattedDate = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const formattedTime = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        item.innerHTML = `
            <div class="history-main">
                <strong>${activityIcons[activity.type] || "🌱"} ${escapeHTML(activityNames[activity.type] || activity.type)}</strong>
                <p>${formatNumber(activity.quantity)} ${activityUnits[activity.type] || ""}</p>
                <small>${formattedDate} · ${formattedTime}</small>
            </div>
            <div class="history-carbon">
                <strong>${Number(activity.co2).toFixed(2)} kg CO₂</strong>
                <button type="button" class="delete-activity" data-id="${activity.id}">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

if (historyList) {
    historyList.addEventListener("click", function (event) {
        const button = event.target.closest(".delete-activity");
        if (!button) return;

        const id = button.dataset.id;
        const activity = activities.find(a => String(a.id) === String(id));
        if (!activity) return;

        const confirmed = confirm(`Delete ${activityNames[activity.type]} activity?`);
        if (!confirmed) return;

        activities = activities.filter(a => String(a.id) !== String(id));
        saveActivities();

        updateDashboard();
        updateHistory();
        showToast("Activity deleted.", "success");
    });
}


/* =========================================================
   FILTERS
   ========================================================= */

if (filterType) filterType.addEventListener("change", updateHistory);
if (filterDate) filterDate.addEventListener("change", updateHistory);

if (clearFilters) {
    clearFilters.addEventListener("click", function () {
        filterType.value = "all";
        filterDate.value = "";
        updateHistory();
        showToast("Filters reset.", "info");
    });
}


/* =========================================================
   EXPORT CSV
   ========================================================= */

if (exportData) exportData.addEventListener("click", exportCSV);

function exportCSV() {
    if (activities.length === 0) {
        showToast("No activities to export.", "error");
        return;
    }

    const headers = ["Activity", "Quantity", "Unit", "CO2 (kg)", "Date"];
    const rows = activities.map(a => [
        activityNames[a.type], a.quantity, activityUnits[a.type],
        Number(a.co2).toFixed(2), new Date(a.date).toLocaleString("en-IN")
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "planetpulse-history.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("📊 CSV exported successfully!", "success");
}


/* =========================================================
   DEMO DATA
   ========================================================= */

if (loadDemoButton) {
    loadDemoButton.addEventListener("click", function () {
        const confirmed = confirm("This will add sample activities for demo purposes. Continue?");
        if (!confirmed) return;

        const demo = [
            { type: "car", quantity: 12, daysAgo: 0 },
            { type: "electricity", quantity: 8, daysAgo: 0 },
            { type: "nonveg-meal", quantity: 1, daysAgo: 1 },
            { type: "bus", quantity: 20, daysAgo: 1 },
            { type: "flight", quantity: 350, daysAgo: 2 },
            { type: "veg-meal", quantity: 2, daysAgo: 2 },
            { type: "electricity", quantity: 5, daysAgo: 3 }
        ];

        demo.forEach(item => {
            const date = new Date();
            date.setDate(date.getDate() - item.daysAgo);
            const co2 = item.quantity * emissionFactors[item.type];

            activities.push({
                id: Date.now() + Math.random(),
                type: item.type, quantity: item.quantity, co2,
                date: date.toISOString()
            });
        });

        saveActivities();
        updateDashboard();
        updateHistory();
        showToast("✨ Demo data loaded!", "success");
    });
}


/* =========================================================
   CLEAR ALL
   ========================================================= */

if (clearData) {
    clearData.addEventListener("click", function () {
        if (activities.length === 0 && weeklyTarget <= 0) {
            showToast("There is no saved data.", "info");
            return;
        }

        const confirmed = confirm("Delete ALL PlanetPulse data? This cannot be undone.");
        if (!confirmed) return;

        activities = [];
        weeklyTarget = 0;
        localStorage.removeItem(ACTIVITIES_KEY);
        localStorage.removeItem(TARGET_KEY);

        updateDashboard();
        updateHistory();
        showToast("All data cleared.", "success");
    });
}


/* =========================================================
   NUMBER ANIMATION
   ========================================================= */

function animateNumber(element, target, duration, formatter) {
    if (!element) return;

    const start = Number(element.dataset.value || 0);
    const difference = target - start;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + difference * eased;

        element.textContent = formatter(current);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.dataset.value = target;
        }
    }

    requestAnimationFrame(animate);
}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(element, value) {
    if (element) element.textContent = value;
}

function formatNumber(value) {
    return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "info") {
    let container = document.getElementById("planetpulseToastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "planetpulseToastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `planetpulse-toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initApp() {
    updateDashboard();
    updateHistory();
    updateWeekLabel();
    updateLiveCalculation();
}

initApp();