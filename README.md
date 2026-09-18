# Planet-pulse
Planet Pulse - A carbon footprint tracker that helps users understand and reduce their daily CO₂ emissions.
# 🌱 PlanetPulse

### Carbon Footprint Intelligence Dashboard

PlanetPulse is a simple and interactive carbon footprint tracker that helps users understand the environmental impact of their everyday choices.

Users can log activities such as transportation, electricity usage, and meals, and instantly see their estimated CO₂ emissions through an interactive dashboard.

---

## 🎯 Problem Statement

Climate change is influenced by millions of everyday decisions, but the carbon impact of those decisions is often difficult to understand.

**PlanetPulse turns daily activities into a visible carbon footprint**, allowing users to:

- Track their daily activities
- Calculate estimated CO₂ emissions
- Compare emissions across activity types
- Set a weekly carbon target
- Monitor their progress
- Review their activity history
- Discover simple ways to reduce their footprint

---

## ✨ Key Features

### 🚗 Activity Logging

Users can record different everyday activities by selecting an activity type and entering a quantity.

Supported activities:

- 🚗 Car travel
- 🚌 Bus travel
- ✈️ Flight travel
- ⚡ Electricity usage
- 🥗 Vegetarian meals
- 🍗 Non-vegetarian meals

---

### 🧮 CO₂ Calculation

PlanetPulse uses fixed emission factors to calculate estimated CO₂ emissions.

| Activity | Emission Factor |
|----------|-----------------|
| 🚗 Car | 0.20 kg CO₂ / km |
| 🚌 Bus | 0.08 kg CO₂ / km |
| ✈️ Flight | 0.25 kg CO₂ / km |
| ⚡ Electricity | 0.80 kg CO₂ / kWh |
| 🥗 Veg Meal | 0.50 kg CO₂ / meal |
| 🍗 Non-Veg Meal | 2.00 kg CO₂ / meal |

### Example

If a user travels **10 km by car**:

```text
10 km × 0.20 kg CO₂/km = 2.00 kg CO₂
